const driverService = require("../service/driverService");

exports.getDriverList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 10000,
    } = req.query;
    const result = await driverService.findAll(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    console.log("Driver list data:", result);
    return res.status(200).json({
      status: 200,
      message: "driver list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getAvailableDriverList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 10000,
    } = req.query;
    const result = await driverService.getAvaiableDrivers(
      keyword,
      sort,
      page,
      size
    );
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "driver list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getSchedule = async (req, res, next) => {
  try {
    const date = req.query.date;
    const userID = req.userId;
    const result = await driverService.findScheduleByDate(userID, date);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "schedule list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getDriverScheduleByMonth = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { year, month } = req.query;
    const result = await driverService.findDriverScheduleByMonth(
      userId,
      year,
      month
    );
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "driver schedule list for month",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
