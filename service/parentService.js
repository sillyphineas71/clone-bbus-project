// services/userService.js
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
  tbl_attendance: Attendence,
} = require("../model");
const busService = require("./busService");
const authService = require("./authService");
const { Op, where } = require("sequelize");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const s3Service = require("./s3Service");
const userService = require("./userService");
const { off } = require("process");
const { Router } = require("express");
const sequelize = require("../config/database-connect");

exports.getStudentListOfAParent = async (userId) => {
  const parent = await Parent.findOne({ where: { user_id: userId } });
  if (!parent) {
    return { status: 404, message: "Parent not found" };
  }
  const students = await Student.findAll({
    where: {
      parent_id: parent.id,
    },
    include: [
      { model: Bus, as: "bus", attributes: ["id", "name"] },
      { model: CheckPoint, as: "checkpoint", attributes: ["id", "name"] },
    ],
  });
  const data = students.map((student) => ({
    id: student.id,
    rollNumber: student.roll_number,
    name: student.name,
    className: student.class_name,
    avatar: student.avatar
      ? `https://your-cdn.com/students/${student.avatar}`
      : null,
    dob: student.dob,
    address: student.address,
    gender: student.gender,
    status: student.status,
    parentId: student.parent_id,
    busId: student.Bus ? student.Bus.id : null,
    busName: student.Bus ? student.Bus.name : null,
    checkpointId: student.Checkpoint ? student.Checkpoint.id : null,
    checkpointName: student.Checkpoint ? student.Checkpoint.name : null,
    checkpointDescription: student.Checkpoint
      ? student.Checkpoint.description
      : null,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  }));
  return {
    status: 200,
    message: "Student list retrieved successfully",
    data,
  };
};
exports.getParentList = async (keyword, sort, page, size) => {
  //page sort
  let [sortField, sortOrder] = sort.split(":");
  sortOrder = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
  //pagination
  const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) - 1 : 0;
  const pageSize = parseInt(size, 10) > 0 ? parseInt(size, 10) : 10;
  const offset = pageNumber * pageSize;
  // filtering keyword
  const whereUser = keyword
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
        ],
      }
    : {};
  const { count: totalParents, rows: parents } = await Parent.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
        where: whereUser,
        attributes: [
          "id",
          "name",
          "phone",
          "email",
          "address",
          "avatar",
          "gender",
          "dob",
          "status",
        ],
      },
    ],
    order: [[{ model: User, as: "user" }, sortField, sortOrder]],
    offset,
    limit: pageSize,
  });
  const parentList = parents.map((parent) => {
    const user = parent.user;
    return {
      id: parent.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      avatar: user.avatar,
      gender: user.gender,
      dob: user.dob,
      status: user.status,
    };
  });
  return {
    status: 200,
    message: "Parent list retrieved successfully",
    data: {
      pageNumber,
      pageSize,
      totalPages: Math.ceil(totalParents / pageSize),
      totalElements: totalParents,
      parents: parentList,
    },
  };
};
exports.registerCheckpoint = async (studentId, checkpointId, parentId) => {
  // Check if the student, parent exists
  const student = await Student.findOne({
    where: { id: studentId },
    include: [{ model: Parent, as: "parent" }],
  });
  if (!student) {
    return { status: 404, message: "Student not found" };
  }
  console.log("Student found:", student.parent.user_id);
  console.log("Student ID:", parentId);
  if (String(student.parent.user_id) !== String(parentId)) {
    return {
      status: 403,
      message: "You are not authorized to register this checkpoint",
    };
  }
  if (student.checkpoint_id) {
    return {
      status: 400,
      message: "Checkpoint already registered for this student",
    };
  }
  // Check if the checkpoint exists
  const checkpoint = await CheckPoint.findAll({
    where: { id: checkpointId },
    include: [{ model: Route, as: "route" }],
  });
  if (!checkpoint) {
    return { status: 404, message: "Checkpoint not found" };
  }
  console.log("Checkpoint:", checkpoint[0].route.id);
  if (!checkpoint[0].route) {
    return { status: 404, message: "Route not found for this checkpoint" };
  }
  // Find the bus associated with the checkpoint
  let routeBuses = await Bus.findAll({
    where: { route_id: checkpoint[0].route.id },
  });

  routeBuses = routeBuses.filter(
    (bus) => bus.amount_of_student < bus.max_capacity
  );
  console.log("Route Buses:", routeBuses);
  if (!routeBuses) {
    return { status: 404, message: "Bus not found for this checkpoint" };
  }
  //Find the default bus
  const defaultBus = await Bus.findByPk("00000000-0000-0000-0000-000000000000");
  if (!defaultBus) {
    return { status: 404, message: "Default bus not found" };
  }
  // Find newest bus to formatted the bus name if needed
  const newestBus = await Bus.findOne({
    order: [["name", "DESC"]],
  });
  let nextBusNumber = 1;
  if (newestBus) {
    const parts = newestBus.name.split(" ");
    if (parts.length == 2) {
      nextBusNumber = parseInt(parts[1]) + 1;
    }
  }
  console.log("Router Buses:", routeBuses);
  // Assign the bus to the student
  let currentBus = routeBuses.length > 0 ? routeBuses[0] : null;
  console.log("Current Bus:", currentBus);
  if (!currentBus || currentBus.amount_of_student >= currentBus.max_capacity) {
    const formattedBusName = `Bus ${String(nextBusNumber).padStart(3, "0")}`;
    const espId = `${String(nextBusNumber).padStart(3, "0")}001`;
    const facesluice = `1${espId}`;
    currentBus = await Bus.create({
      id: uuidv4(),
      name: formattedBusName,
      esp_id: espId,
      route_id: checkpoint[0].route.id,
      status: "ACTIVE",
      max_capacity: defaultBus.max_capacity,
      amount_of_student: 0,
    });
    //update camera for the new bus
    const camera = await Camera.findOne({
      where: { facesluice: facesluice },
    });
    if (!camera) {
      await Camera.create({
        facesluice: facesluice,
      });
    }
    camera.bus_id = currentBus.id;
    await camera.save();
  }

  // increase the number of students on the bus
  currentBus.amount_of_student += 1;
  await currentBus.save();
  // Update the student's checkpoint and bus
  student.bus_id = currentBus.id;
  student.checkpoint_id = checkpoint[0].id;
  await student.save();
  console.log("Bus: ", currentBus);
  const data = await busService.getBusResponse(currentBus);
  console.log("data:", data);
  return {
    status: 200,
    message: "Register checkpoint success",
    data: data,
  };
};

exports.registerCheckpointForAllChildren = async (checkpointId, parentId) => {
  const t = await sequelize.transaction();
  try {
    const children = await Student.findAll({
      include: [
        {
          model: Parent,
          as: "parent",
          where: { user_id: parentId },
        },
      ],
      transaction: t,
    });

    if (!children || children.length === 0) {
      await t.rollback();
      return { status: 404, message: "No students found for this parent." };
    }

    const anyHasCheckpoint = children.some(
      (student) => !!student.checkpoint_id
    );
    if (anyHasCheckpoint) {
      await t.rollback();
      return {
        status: 400,
        message:
          "One or more students already registered a checkpoint. Please use individual registration.",
      };
    }

    const checkpoint = await CheckPoint.findOne({
      where: { id: checkpointId },
      include: [{ model: Route, as: "route" }],
      transaction: t,
    });
    if (!checkpoint) {
      await t.rollback();
      return { status: 404, message: "Checkpoint not found." };
    }
    if (!checkpoint.route) {
      await t.rollback();
      return {
        status: 400,
        message: "Checkpoint has not been assigned to any route.",
      };
    }

    let routeBuses = await Bus.findAll({
      where: { route_id: checkpoint.route.id },
      transaction: t,
    });
    routeBuses = routeBuses.filter(
      (bus) => bus.amount_of_student < bus.max_capacity
    );

    const defaultBus = await Bus.findByPk(
      "00000000-0000-0000-0000-000000000000",
      { transaction: t }
    );
    if (!defaultBus) {
      await t.rollback();
      return { status: 404, message: "Default bus not found." };
    }

    const newestBus = await Bus.findOne({
      order: [["name", "DESC"]],
      transaction: t,
    });
    let nextBusNumber = 1;
    if (newestBus) {
      const parts = newestBus.name.split(" ");
      if (parts.length == 2) {
        nextBusNumber = parseInt(parts[1]) + 1;
      }
    }

    let currentBus = routeBuses.length > 0 ? routeBuses[0] : null;
    const responses = [];

    for (const student of children) {
      if (
        !currentBus ||
        currentBus.amount_of_student >= currentBus.max_capacity
      ) {
        const formattedBusName = `Bus ${String(nextBusNumber).padStart(
          3,
          "0"
        )}`;
        const espId = `${String(nextBusNumber).padStart(3, "0")}001`;
        const facesluice = `1${espId}`;
        currentBus = await Bus.create(
          {
            id: uuidv4(),
            name: formattedBusName,
            esp_id: espId,
            route_id: checkpoint.route.id,
            status: "ACTIVE",
            max_capacity: defaultBus.max_capacity,
            amount_of_student: 0,
          },
          { transaction: t }
        );
        nextBusNumber++;

        let camera = await Camera.findOne({
          where: { facesluice: facesluice },
          transaction: t,
        });
        if (!camera) {
          camera = await Camera.create(
            {
              facesluice: facesluice,
              bus_id: currentBus.id,
            },
            { transaction: t }
          );
        } else {
          camera.bus_id = currentBus.id;
          await camera.save({ transaction: t });
        }

        responses.push({
          id: currentBus.id,
          name: currentBus.name,
          esp_id: currentBus.esp_id,
          route_id: currentBus.route_id,
          status: currentBus.status,
          max_capacity: currentBus.max_capacity,
          amount_of_student: currentBus.amount_of_student,
        });
      }

      currentBus.amount_of_student += 1;
      await currentBus.save({ transaction: t });

      student.bus_id = currentBus.id;
      student.checkpoint_id = checkpoint.id;
      await student.save({ transaction: t });
    }

    await t.commit();

    return {
      status: 200,
      message: "Register checkpoint for all children success",
      data: responses,
    };
  } catch (err) {
    await t.rollback();
    console.error(err);
    return { status: 500, message: "Internal server error" };
  }
};
exports.removeStudentFromCurrentBusAndCheckpoint = async (student) => {
  const currentBus = await Bus.findOne({
    where: { id: student.bus_id },
  });
  if (currentBus) {
    const newAmount = Math.max(0, currentBus.amount_of_student - 1);
    currentBus.amount_of_student = newAmount;
    await currentBus.save();
  }
  student.bus_id = null;
  student.checkpoint_id = null;
  console.log("Removing student from bus and checkpoint: ", student);
  await student.save();
};
exports.upsertCheckpoint = async (studentId, checkpointId, parentId) => {
  const student = await Student.findOne({
    where: { id: studentId },
    include: [{ model: Parent, as: "parent" }],
  });

  if (!student) {
    return { status: 404, message: "Student not found" };
  }
  if (String(student.parent.user_id) !== String(parentId)) {
    return {
      status: 403,
      message: "You are not authorized to update this student's checkpoint",
    };
  }
  const checkpoint = await CheckPoint.findOne({ where: { id: checkpointId } });
  if (!checkpoint) {
    return { status: 404, message: "Checkpoint not found" };
  }

  //neu hoc sinh da co checkpoint -> doi
  if (student.checkpoint_id != null) {
    await this.removeStudentFromCurrentBusAndCheckpoint(student);
  }
  //Tìm tất cả các attendance trong tương lai của student này đổi thành checkpoint mới
  const attendanceList = await Attendence.findAll({
    where: {
      student_id: studentId,
      date: { [Op.gt]: new Date() },
    },
  });
  for (const attendance of attendanceList) {
    attendance.checkpoint_id = checkpointId;
    attendance.status = "ABSENT";
    await attendance.save();
  }
  return this.registerCheckpoint(studentId, checkpointId, parentId);
};

exports.upsertCheckpointForAllChildren = async (checkpointId, parentId) => {
  const students = await Student.findAll({
    where: { parent_id: parentId },
    include: [{ model: Parent, as: "parent" }],
  });
  if (!students) {
    return {
      status: 404,
      message: "Không tìm thấy học sinh nào thuộc phụ huynh",
    };
  }
  if (String(students[0].parent.user_id) !== String(parentId)) {
    return {
      status: 403,
      message: "You are not authorized to update this student's checkpoint",
    };
  }
  const checkpoint = await CheckPoint.findOne({ where: { id: checkpointId } });
  if (!checkpoint) {
    return { status: 404, message: "Checkpoint not found" };
  }
  for (const student of students) {
    if (student.checkpoint_id != null) {
      await this.removeStudentFromCurrentBusAndCheckpoint(student);
    }
  }
  const studentIds = students.map((student) => student.id);

  const attendanceList = await Attendence.findAll({
    where: {
      student_id: { [Op.in]: studentIds },
      date: { [Op.gt]: new Date() },
    },
  });
  for (const attendance of attendanceList) {
    attendance.checkpoint_id = checkpointId;
    attendance.status = "ABSENT";
    await attendance.save();
  }
  return this.registerCheckpointForAllChildren(checkpointId);
};

exports.updateStudentInfo = async (StudentUpdateByParentRequest, parentId) => {
  const student = await Student.findOne({
    where: { id: StudentUpdateByParentRequest.studentId },
    include: [{ model: Parent, as: "parent" }],
  });
  if (String(student.parent.user_id) !== String(parentId)) {
    return {
      status: 403,
      message: "Bạn không có quyền cập nhật thông tin của học sinh này",
    };
  }
  if (StudentUpdateByParentRequest.name != null) {
    student.name = StudentUpdateByParentRequest.name;
  }
  if (StudentUpdateByParentRequest.dob != null) {
    student.dob = StudentUpdateByParentRequest.dob;
  }
  if (StudentUpdateByParentRequest.address != null) {
    student.address = StudentUpdateByParentRequest.address;
  }

  await student.save();
};
