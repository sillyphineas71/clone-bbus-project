const { tbl_student: Student } = require("../model");
const { Op } = require("sequelize");
const studentService = require("../service/studentService");

exports.getList = (req, res, next) => {
  const { keyword, sort, page = 0, size = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const sizeNum = parseInt(size, 10);

  studentService
    .findAll(keyword, sort, pageNum, sizeNum)
    .then((pageResponse) => {
      res.status(200).json({
        status: 200,
        message: "student list",
        data: pageResponse,
      });
    })
    .catch((err) => next(err));
};

exports.getStudentsByBusId = (req, res, next) => {
  const { busId } = req.query;
  studentService
    .getStudentsByBusId(busId)
    .then((students) => {
      res.status(200).json({
        status: 200,
        message: "get students by bus",
        data: students,
      });
    })
    .catch((err) => next(err));
};

exports.getStudentDetail = (req, res, next) => {
  const studentId = req.params.studentId;
  studentService
    .findById(studentId)
    .then((studentData) => {
      if (!studentData) {
        return res.status(404).json({
          status: 404,
          message: "Student not found",
        });
      }
      res.status(200).json({
        status: 200,
        message: "get student detail",
        data: studentData,
      });
    })
    .catch((err) => next(err));
};

exports.createStudent = (req, res, next) => {
  const studentCreationRequest = {
    rollNumber: req.body.roll_number,
    name: req.body.name,
    className: req.body.class_name,
    dob: req.body.dob,
    address: req.body.address,
    gender: req.body.gender,
    status: req.body.status,
    parentId: req.body.parent_id,
    avatar: req.files,
  };
  studentService
    .save(studentCreationRequest)
    .then((student) => {
      res.status(201).json({
        status: 201,
        message: "student created successfully",
        data: student.roll_number,
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(err.status || 500)
        .json({ status: err.status || 500, message: err.message });
    });
};

exports.updateStudent = (req, res, next) => {
  const studentUpdateRequest = {
    id: req.body.id,
    rollNumber: req.body.rollNumber,
    className: req.body.className,
    name: req.body.name,
    dob: req.body.dob,
    address: req.body.address,
    gender: req.body.gender,
    parentId: req.body.parentId,
    checkpointId: req.body.checkpointId,
  };

  studentService
    .update(studentUpdateRequest)
    .then(() => {
      res.status(200).json({
        status: 200,
        message: "student updated successfully",
        data: "",
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(err.status || 500)
        .json({ status: err.status || 500, message: err.message });
    });
};

exports.changeStatus = (req, res, next) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({
      status: 400,
      message: "Bạn phải truyền cả id và status",
      data: "",
    });
  }
  studentService
    .changeStatus({ id, status })
    .then(() => {
      res.status(202).json({
        status: 202,
        message: "student change status successfully",
        data: "",
      });
    })
    .catch(next);
};
