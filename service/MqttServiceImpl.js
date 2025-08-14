const {
  tbl_camera: Camera,
  tbl_camera_request: CameraRequest,
  tbl_camera_request_detail: CameraRequestDetail,
  tbl_student: Student,
  tbl_parent: Parent,
  tbl_user: User,
} = require("../model");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");
const cameraService = require("./cameraService");
const mqttPublisherService = require("../mqtt/MqttPublisherService");
const s3Service = require("./s3Service");
const cameraRequestService = require("./cameraRequestService");
const cameraRequestDetailService = require("./cameraRequestDetailService");
const busService = require("./busService");
const attendanceService = require("./attendanceService");
const wedSocketHandle = require("../config/webSocketHandle");
const firebaseService = require("./firebaseService");

const DateTimeUtils = require("../util/dateTimeUtils");

const PersonListMqttJson = require("../model/mqtt/PersonListMqttJson");
const AttendanceResponse = require("../model/dto/response/attendance/AttendanceResponse");
const ResultMessage = require("../model/mqtt/ResultMessage");
const e = require("express");
const { is } = require("date-fns/locale");
const {
  AttendanceRate,
} = require("../model/dto/response/attendance/Dashboard");

exports.publishStudentsList = async (students, operationType, facesluice) => {
  const camera = await Camera.findOne({ where: { facesluice: facesluice } });
  if (!camera) {
    throw new Error("Camera not found for facesluice: " + facesluice);
  }
  let request_type;
  let type = "";
  switch (operationType) {
    case "AddPersons":
      request_type = "ADD";
      type = "ADD";
      break;
    case "DeletePersons":
      request_type = "DELETE";
      type = "DELETE";
      break;
    case "EditPersons":
      request_type = "EDIT";
      type = "EDIT";
      break;
    default:
      throw new Error("Invalid operation type: " + operationType);
  }
  const cameraRequest = await CameraRequest.create({
    id: uuidv4(),
    camera_id: camera.facesluice,
    request_type: request_type,
    //status: "FAILED",
  });
  const cameraRequestDetails = [];
  for (const student of students) {
    const cameraRequestDetail = {
      id: uuidv4(),
      err_code: 1,
      person_type: 0,
      camera_request_id: cameraRequest.id,
      student_id: student.id,
      avatar: student.avatar,
      name: student.name,
      roll_number: student.roll_number,
    };
    cameraRequestDetails.push(cameraRequestDetail);
  }
  await cameraRequestDetailService.saveAll(cameraRequestDetails);
  const personInfos = [];
  const format = "yyyy-MM-dd'T'HH:mm:ss";
  const firstSep = dayjs()
    .year(new Date().getFullYear())
    .month(8)
    .date(1)
    .hour(0)
    .minute(0)
    .second(0);
  const cardValidBegin = firstSep.format(format);
  const cardValidEnd = firstSep.add(1, "year").format(format);

  for (const student of students) {
    let avatarUrl = "";
    try {
      avatarUrl = await s3Service.generatePresignedUrl(
        "students/" + student.avatar
      );
    } catch (err) {
      throw new Error(
        `Error generating presigned URL for student avatar: {${err.message}}`
      );
    }
    const personInfo = new PersonListMqttJson().info;
    if (operationType === "AddPersons") {
      personInfo.customId = String(student.id);
      personInfo.name = String(student.name);
      personInfo.personType = 0; // 0 = student
      personInfo.tempCardType = 0; // 0 = temporary card type
      personInfo.cardValidBegin = cardValidBegin;
      personInfo.cardValidEnd = cardValidEnd;
      personInfo.picURI = avatarUrl;
    }

    personInfos.push(personInfo);
  }
  if (personInfos.length === 0) {
    return;
  }
  const nowStr = dayjs().format("YYYYMMDDHHmmssSSS");
  const studentJson = new PersonListMqttJson({
    messageId: type + "List" + nowStr,
    dataBegin: "DataBegin",
    operator: type,
    personNum: String.valueOf(personInfos.length),
    info: personInfos,
    dataEnd: "EndFlag",
  });
  try {
    mqttPublisherService.publishMessage(facesluice, studentJson);
  } catch (err) {
    throw new Error(err.message || "Error publishing MQTT message");
  }
};
exports.handleAttendanceMessage = async (message, topic) => {
  const title = "";
  const student = Student.findOne({
    where: { id: message.info.customId },
    include: [
      {
        model: Parent,
        as: "parent",
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      },
    ],
  });
  if (!student) {
    throw new Error("Student not found for customId: " + message.info.customId);
  }
  const bus = await busService.findByCamera_Facesluice(
    getCameraFacesluiceFromTopicRec(topic)
  );
  if (!bus) {
    throw new Error(
      "Bus not found for facesluice: " + getCameraFacesluiceFromTopicRec(topic)
    );
  }
  const timeString = message.info.time;
  const time = DateTimeUtils.convertStringToDate(
    timeString,
    "yyyy-MM-dd HH:mm:ss"
  );
  const date = dayjs().format("YYYY-MM-DD");

  const attendance = attendanceService.findByStudent_IdAndDateAndDirection(
    student.id,
    date,
    isNotOverNoon(timeString) ? "PICK_UP" : "DROP_OFF"
  );
  if (!attendance) {
    attendance.student_id = student.id;
    attendance.date = date;
    attendance.checkpoint_id = student.checkpoint_id;
    attendance.direction = isNotOverNoon(timeString) ? "PICK_UP" : "DROP_OFF";
    attendance.status = "ABSENT";
    attendance.bus_id = bus.id;
  }
  if (attendance.checkin != null && attendance.checkout == null) {
    console.log("Student has already checked in today");
    const checkinTime = dayjs(attendance.checkin).valueOf();
    const currentTime = dayjs(time).valueOf();
    if (currentTime - checkinTime < 5000) return;
    attendance.checkout(time);
    attendance.status = "ATTENDED";
    title = "Con bạn đã xuống xe";
  } else if (attendance.checkin == null) {
    console.log("Student has not checked in today");
    attendance.checkin(time);
    attendance.status = "IN_BUS";
    attendance.modified_by = "camera";
    title = "Con bạn đã lên xe";
  } else {
    console.error("Student has already checked out today");
  }
  await attendanceService.save(attendance);
  const attendanceResponse = new AttendanceResponse(attendance);
  wedSocketHandle.publishStudentStatus(
    bus.id + "/" + (isNotOverNoon(timeString) ? "0" : "1") + "/student-status",
    attendanceResponse
  );
  const deviceToken = student.parent.user.device_token;
  if (!deviceToken) {
    throw new Error("Device token not found");
  }
  const attendanceSendMessage = {
    studentId: student.id,
    studentName: student.name,
    status: attendance.status,
    direction: attendance.direction,
    time: timeString,
    modifiedBy: "Điểm danh tự động bằng camera",
    pic: message.info.pic,
  };
  try {
    const jsonMessage = JSON.stringify(attendanceSendMessage);
    await firebaseService.sendNotificationToSpecificUser(
      student.parent.user.device_token,
      title,
      jsonMessage
    );
  } catch (err) {
    throw new Error("Error processing JSON", err);
  }
};
exports.handleResultMessage = async (resultMessage, topicReceive) => {
  const facesluice = getCameraFacesluiceFromTopicAck(topicReceive);
  let studentIdsWithReturnCode = resultMessage.info.AddErrInfo;
  if (studentIdsWithReturnCode == null) {
    studentIdsWithReturnCode = [];
  }
  for (const addSucInfo of resultMessage.info.AddSucInfo) {
    studentIdsWithReturnCode.push(
      new ResultMessage.AddErrInfo({
        customId: addSucInfo.customId,
        errCode: 0,
      })
    );
  }
  const cameraRequest = await CameraRequest.findOne({
    include: [
      {
        model: Camera,
        as: "camera",
        where: { facesluice: facesluice },
      },
    ],
    order: [["created_at", "DESC"]],
  });
  for (const addErrInfo of studentIdsWithReturnCode) {
    const student = await Student.findOne({
      where: { id: addErrInfo.customId },
    });
    const cameraRequestDetailId = {
      camera_request_id: cameraRequest.id,
      student_id: student.id,
    };
    const cameraRequestDetail = await CameraRequestDetail.findOne({
      where: cameraRequestDetailId,
    });
    cameraRequestDetail.err_code = addErrInfo.errcode;
    await cameraRequestDetail.save();
  }
};

const getCameraFacesluiceFromTopicRec = (topic) => {
  //"mqtt/face/\\d+/Rec"
  return topic.substring(
    topic.lastIndexOf("/", topic.lastIndexOf("/Rec") - 1) + 1,
    topic.lastIndexOf("/Rec")
  );
};
const getCameraFacesluiceFromTopicAck = (topic) => {
  //"mqtt/face/\\d+/Ack"
  return topic.substring(
    topic.lastIndexOf("/", topic.lastIndexOf("/Ack") - 1) + 1,
    topic.lastIndexOf("/Ack")
  );
};

const isNotOverNoon = (time) => {
  const dateTime = dayjs(time, "YYYY-MM-DD HH:mm:ss");
  return dateTime.hour() < 12;
};
