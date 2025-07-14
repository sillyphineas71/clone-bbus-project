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
} = require("../model");
const { Op, where } = require("sequelize");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const s3Service = require("./s3Service");
const userService = require("./userService");
const { off } = require("process");
const { Router } = require("express");

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
exports.registerCheckpoint = async (studentId, checkpointId, parentUserId) => {
  // Check if the student, parent exists
  const student = await Student.findAll(
    { where: { id: studentId } },
    {
      include: [{ model: Parent, as: "parent" }],
    }
  );
  if (!student) {
    return { status: 404, message: "Student not found" };
  }
  if (String(student[0].parent.user_id) === String(parentUserId)) {
    return {
      status: 403,
      message: "You are not authorized to register this checkpoint",
    };
  }
  if (student[0].checkpoint_id) {
    return {
      status: 400,
      message: "Checkpoint already registered for this student",
    };
  }
  // Check if the checkpoint exists
  const checkpoint = await CheckPoint.findAll(
    { where: { id: checkpointId } },
    { include: [{ model: Route, as: "route" }] }
  );
  if (!checkpoint) {
    return { status: 404, message: "Checkpoint not found" };
  }
  if (!checkpoint[0].route) {
    return { status: 404, message: "Route not found for this checkpoint" };
  }
  // Find the bus associated with the checkpoint
  const routeBuses = await Bus.findAll({
    where: { route_id: checkpoint[0].router.id },
  });

  routeBuses = routeBuses.filter(
    (bus) => bus.amount_of_student < bus.max_capacity
  );
  if (!routeBuses) {
    return { status: 404, message: "Bus not found for this checkpoint" };
  }
};
