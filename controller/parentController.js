const { Parent, Student, Bus, CheckPoint } = require("../model");
const { Op } = require("sequelize");
const parentService = require("../service/parentService");
const StudentUpdateByParentRequest = require("../model/dto/request/student/StudentUpdateByParentRequest");

exports.getStudentListOfAParent = async (req, res, next) => {
  try {
    //const userId = req.params.userId;
    const userId = req.userId; // Replace with actual user ID from request or session
    console.log("User ID:", userId);
    const result = await parentService.getStudentListOfAParent(userId);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Student list retrieved successfully",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getParentList = async (req, res, next) => {
  try {
    const { keyword = "", sort = "id: asc", page = 1, size = 10 } = req.query;
    const result = await parentService.getParentList(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Parent list retrieved successfully",
      data: result.data,
      totalCount: result.totalCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.registerCheckpoint = async (req, res, next) => {
  try {
    const { studentId, checkpointId } = req.query;
    const parentId = req.userId; // Assuming userId is the parent ID
    if (!studentId || !checkpointId) {
      return res
        .status(400)
        .json({ message: "Student ID and Checkpoint ID are required" });
    }
    const result = await parentService.registerCheckpoint(
      studentId,
      checkpointId,
      parentId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Checkpoint registered successfully",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

exports.registerCheckpointForAllChildren = async (req, res, next) => {
  try {
    const { checkpointId } = req.query;
    const parentId = req.userId; // Assuming userId is the parent ID
    if (!checkpointId) {
      return res.status(400).json({ message: "Checkpoint ID are required" });
    }
    const result = await parentService.registerCheckpointForAllChildren(
      checkpointId,
      parentId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Checkpoint registered successfully",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};
exports.upsertCheckpoint = async (req, res, next) => {
  try {
    const { studentId, checkpointId } = req.query;
    if (!studentId || !checkpointId) {
      return res
        .status(400)
        .json({ message: "Student ID and Checkpoint ID are required" });
    }
    const parentId = req.userId; // Assuming userId is the parent ID
    console.log("Student ID:", studentId);
    console.log("Checkpoint ID:", checkpointId);
    const result = await parentService.upsertCheckpoint(
      studentId,
      checkpointId,
      parentId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Checkpoint upserted successfully",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};
exports.upsertCheckpointForAllChildren = async (req, res, next) => {
  try {
    const { checkpointId } = req.query;
    const parentId = req.userId; // Assuming userId is the parent ID
    if (!checkpointId) {
      return res
        .status(400)
        .json({ status: 400, message: "Checkpoint ID is required" });
    }
    const result = await parentService.upsertCheckpointForAllChildren(
      checkpointId,
      parentId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "Checkpoint upserted for all children successfully",
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};
exports.updateStudentInfo = async (req, res, next) => {
  try {
    studentUpdateByParentRequest = new StudentUpdateByParentRequest(req.body);
    const parentId = req.userId; // Assuming userId is the parent ID
    await parentService.updateStudentInfo(
      studentUpdateByParentRequest,
      parentId
    );
    return res.status(200).json({
      status: 200,
      message: "Student info updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};
