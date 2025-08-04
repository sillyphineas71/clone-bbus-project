const attendanceService = require("../service/attendanceService");

exports.getList = async (req, res, next) => {
  try {
    const { busId, date, busDirection } = req.query;
    const result = await attendanceService.findAllByBusIdAndDateAndDirection(
      busId,
      date,
      busDirection
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

exports.getAttendanceHistoryOfAStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const result = await attendanceService.getAttendanceHistoryOfAStudent(
      studentId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getAttendanceOfAStudentForParent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const date = req.query.date;
    const result =
      await attendanceService.getAttendanceHistoryOfAStudentForParent(
        studentId,
        date
      );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

exports.manualAttendance = async (req, res, next) => {
  try {
    const manualAttendanceRequest = req.body;
    const userId = req.userId;
    const result = await attendanceService.manualAttendance(
      manualAttendanceRequest,
      userId
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getFinalReport = async (req, res, next) => {
  try {
    const result = await attendanceService.generateFinalReport();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getBusReport = async (req, res, next) => {
  try {
    const result = await attendanceService.generateBusReport();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getRouteReport = async (req, res, next) => {
  try {
    const result = await attendanceService.generateRouteReport();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const result = await attendanceService.generateAttendanceReport();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getDriverAndAssistantReport = async (req, res, next) => {
  try {
    const result = await attendanceService.generateDriverAndAssistantReport();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getDashboard = async (req, res, next) => {
  try {
    const result = await attendanceService.dashboard();
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
