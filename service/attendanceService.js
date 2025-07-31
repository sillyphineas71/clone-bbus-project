const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
  tbl_driver: Driver,
  tbl_parent: Parent,
  tbl_teacher: Teacher,
  tbl_assistant: Assistant,
  tbl_student: Student,
  tbl_bus: Bus,
  tbl_checkpoint: CheckPoint,
  tbl_route: Route,
  tbl_camera: Camera,
  tbl_attendance: Attendance,
  tbl_bus_schedule: BusSchedule,
} = require("../model");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const { format, getMonth, getYear } = require("date-fns");
const AttendanceResponse = require("../model/dto/response/attendance/AttendanceResponse");
const AttendanceResponseForAdmin = require("../model/dto/response/attendance/AttendanceResponseForAdmin");
const {
  DashBoard,
  AttendanceRate,
} = require("../model/dto/response/attendance/Dashboard");
const firebaseMessagingService = require("./firebaseService");
const DateTimeUtils = require("../util/dateTimeUtils");
const AttendanceRepository = require("../repository/AttendanceRepository");
const sequelize = require("../config/database-connect");

exports.getAttendanceResponse = async (attendance) => {
  return new AttendanceResponse(attendance);
};
exports.findAllByBusIdAndDateAndDirection = async (busId, date, direction) => {
  const attendances = await Attendance.findAll({
    where: { bus_id: busId, date: date, direction: direction },
    include: [
      {
        model: Student,
        as: "student",
        include: [
          {
            model: Parent,
            as: "parent",
            include: [{ model: User, as: "user" }],
          },
        ],
      },
      { model: CheckPoint, as: "checkpoint" },
    ],
  });
  const response = [];
  for (const attendance of attendances) {
    const attendanceResponse = await this.getAttendanceResponse(attendance);
    response.push(attendanceResponse);
  }
  return {
    status: 200,
    message: "bus list",
    data: response,
  };
};

exports.getAttendanceHistoryOfAStudent = async (studentId) => {
  const attendanceHistories = await Attendance.findAll({
    include: [
      {
        model: Student,
        as: "student",
        where: { id: studentId },
      },
      {
        model: CheckPoint,
        as: "checkpoint",
      },
      {
        model: Bus,
        as: "bus",
        include: [
          {
            model: BusSchedule,
            as: "tbl_bus_schedules",
            include: [
              {
                model: Assistant,
                as: "assistant",
                include: [{ model: User, as: "user" }],
              },
              {
                model: Driver,
                as: "driver",
                include: [{ model: User, as: "user" }],
              },
              {
                model: Route,
                as: "route",
              },
            ],
          },
        ],
      },
    ],
  });
  const response = [];
  for (const attendance of attendanceHistories) {
    const attendanceResponse = new AttendanceResponseForAdmin(
      attendance.id,
      attendance.bus.tbl_bus_schedules[0].driver.user.name,
      attendance.bus.tbl_bus_schedules[0].assistant.user.name,
      attendance.date,
      attendance.bus.tbl_bus_schedules[0].route.code,
      attendance.bus.tbl_bus_schedules[0].route.description,
      attendance.direction,
      attendance.status,
      attendance.checkin,
      attendance.checkout,
      attendance.checkpoint.name,
      attendance.modified_by == null ? "" : attendance.modified_by
    );
    response.push(attendanceResponse);
  }
  return {
    status: 200,
    message: "bus list",
    data: response,
  };
};

exports.getAttendanceHistoryOfAStudentForParent = async (studentId, date) => {
  const attendances = await Attendance.findAll({
    where: { date: date },
    include: [
      {
        model: Student,
        as: "student",
        where: { id: studentId },
        include: [
          {
            model: Parent,
            as: "parent",
            include: [{ model: User, as: "user" }],
          },
        ],
      },
      { model: CheckPoint, as: "checkpoint" },
    ],
    order: [["direction", "ASC"]],
  });
  const response = [];
  for (const attendance of attendances) {
    const attendanceResponse = await this.getAttendanceResponse(attendance);
    response.push(attendanceResponse);
  }
  return {
    status: 200,
    message: "bus list",
    data: response,
  };
};

exports.manualAttendance = async (manualAttendanceRequest, userId) => {
  if (!manualAttendanceRequest.attendanceId) {
    return {
      status: 400,
      message: "AttendanceId là bắt buộc",
    };
  }
  const attendance = await Attendance.findOne({
    where: { id: manualAttendanceRequest.attendanceId },
    include: [
      {
        model: Student,
        as: "student",
        include: [
          {
            model: Parent,
            as: "parent",
            include: [{ model: User, as: "user" }],
          },
        ],
      },
    ],
  });
  if (!attendance) {
    return {
      status: 404,
      message: "Attendance not found",
    };
  }
  let update = false;
  if (manualAttendanceRequest.checkin) {
    attendance.checkin = manualAttendanceRequest.checkin;
    attendance.status = "IN_BUS";
    update = true;
  }
  if (manualAttendanceRequest.checkout) {
    attendance.checkout = manualAttendanceRequest.checkout;
    attendance.status = "ATTENDED";
    update = true;
  }
  if (update == true) {
    attendance.modified_by = `Điểm danh thủ công bởi phụ xe: ${userId}`;
    await attendance.save();
  } else {
    return {
      status: 400,
      message: "Phải truyền ít nhất một trong hai trường checkin hoặc checkout",
    };
  }
  try {
    let title;
    const attendanceMessage = {
      studentId: attendance.student.id,
      studentName: attendance.student.name,
      time: "",
      direction: attendance.direction,
      status: attendance.status,
      modifiedBy: attendance.modified_by,
    };
    console.log("attendanceMessage", attendanceMessage);
    if (String(attendance.status) === "IN_BUS") {
      const time = attendance.checkin;
      //Convert from util.date to "yyyy-MM-dd HH:mm:ss" format
      const timeString = DateTimeUtils.convertDateToString(
        time,
        "yyyy-MM-dd HH:mm:ss"
      );
      attendanceMessage.time = timeString;
      title = "Con bạn đã lên xe";
    } else {
      const time = attendance.checkout;
      //Convert from util.date to "yyyy-MM-dd HH:mm:ss" format
      const timeString = DateTimeUtils.convertDateToString(
        time,
        "yyyy-MM-dd HH:mm:ss"
      );
      attendanceMessage.time = timeString;
      title = "Con bạn đã xuống xe";
    }
    // Convert to JSON string
    const message = JSON.stringify(attendanceMessage);
    console.log("Message", message);
    // Send notification to parent
    const deviceId = attendance.student.parent.user.device_token;
    const resposnse =
      await firebaseMessagingService.sendNotificationToSpecificUser(
        deviceId,
        title,
        message
      );
    return {
      status: 200,
      message: "Manual attendance successfully updated",
    };
  } catch (err) {
    return {
      status: 500,
      message: err,
    };
  }
};
exports.generateFinalReport = async () => {
  const result = await AttendanceRepository.getGradeReport();
  const response = result.map((item) => {
    return {
      grade: parseInt(item.grade),
      amountOfStudentRegistered: parseInt(item.amountofstudentregistered),
      amountOfStudentDeregistered: parseInt(item.amountofstudentderegistered),
    };
  });
  return {
    status: 200,
    message: "Final report",
    data: response,
  };
};

exports.generateBusReport = async () => {
  const schedules = await BusSchedule.findAll({
    attributes: [
      [Sequelize.col("bus.license_plate"), "license_plate"],
      [Sequelize.col("bus.max_capacity"), "max_capacity"],
      [
        Sequelize.fn("COUNT", Sequelize.col("tbl_bus_schedule.id")),
        "amountOfRide",
      ],
      [Sequelize.col("assistant->user.name"), "assistantName"],
      [Sequelize.col("driver->user.name"), "driverName"],
    ],
    include: [
      {
        model: Bus,
        as: "bus",
        attributes: [],
      },
      {
        model: Assistant,
        as: "assistant",
        attributes: [],
        include: [{ model: User, as: "user", attributes: [] }],
      },
      {
        model: Driver,
        as: "driver",
        attributes: [],
        include: [{ model: User, as: "user", attributes: [] }],
      },
    ],
    group: [
      "bus.license_plate",
      "bus.max_capacity",
      "assistant.user.id",
      "driver.user.id",
    ],
    raw: true,
  });
  const result = await schedules.map((item) => {
    return {
      licensePlate: item.license_plate,
      driverName: item.driverName,
      assistantName: item.assistantName,
      amountOfRide: parseInt(item.amountOfRide),
      maxCapacity: item.max_capacity,
    };
  });

  return {
    status: 200,
    message: "Bus report",
    data: result,
  };
};

exports.generateRouteReport = async () => {
  const results = await AttendanceRepository.routeReport();
  const response = results.map((item) => {
    return {
      routeName: item.routename,
      path: item.pathname,
      amountOfStudent: parseInt(item.amountofstudent),
      amountOfTrip: parseInt(item.amountoftrip),
    };
  });
  return {
    status: 200,
    message: "Route report",
    data: response,
  };
};
exports.generateAttendanceReport = async () => {
  const result = await AttendanceRepository.attendanceReport();
  const response = await result.map((item) => {
    return {
      studentName: item.name,
      rollNumber: item.roll_number,
      checkInNumber: parseInt(item.checkinnumber),
      checkOutNumber: parseInt(item.checkoutnumber),
      totalCheckNumber: parseInt(item.totalcheckinout),
      note: item.note,
    };
  });
  return {
    status: 200,
    message: "Route report",
    data: response,
  };
};
exports.generateDriverAndAssistantReport = async () => {
  const result = await AttendanceRepository.driverAndAssistantReport();
  const response = result.map((item) => {
    return {
      driverName: item.driver_name,
      assistantName: item.assistant_name,
      numberOfManualAttendance: parseInt(item.numberofmanualattendance),
    };
  });
  return {
    status: 200,
    message: "Route report",
    data: response,
  };
};

exports.dashboard = async () => {
  const totalActiveStudent = await Student.count({
    where: { status: "ACTIVE" },
  });
  const totalActiveRoute = await Route.count();
  const totalActiveUser = await User.count({ where: { status: "ACTIVE" } });

  const today = new Date();
  // Determine academic year start and end based on whether today is before or after July
  let year = getYear(today);
  if (getMonth(today) + 1 > 7) {
    // After July (August or later)
    year += 1;
  }
  const startDate = new Date(year - 1, 8, 1);
  const endDate = new Date(year, 5, 1);

  const result = await AttendanceRepository.findAttendanceRate(
    startDate,
    endDate
  );
  const attendanceRates = result.map((item) => {
    return {
      percentage: item.non_uuid_percentage,
      month: item.month,
    };
  });
  const dashboard = new DashBoard(
    totalActiveStudent,
    totalActiveRoute,
    totalActiveUser,
    attendanceRates
  );
  return {
    status: 200,
    message: "Dashboard",
    data: dashboard,
  };
};
