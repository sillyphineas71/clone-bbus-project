const { Parent, Student, Bus, CheckPoint } = require("../model");
const { Op } = require("sequelize");
const parentService = require("../service/parentService");

exports.getStudentListOfAParent = async (req, res, next) => {
  try {
    //const userId = req.params.userId;
    const userId = "74e81816-26fd-4243-8e72-7e0b11a23440"; // Replace with actual user ID from request or session
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
