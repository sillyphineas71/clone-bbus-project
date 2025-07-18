const assistantService = require("../service/assistantService");

exports.getAssistantList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await assistantService.findAll(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "assistant list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getAvailableAssistantList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await assistantService.getAvaiableAssistants(
      keyword,
      sort,
      page,
      size
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "assistant list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const date = req.query.date;
    const userId = req.userId;
    console.log("User ID:", userId);
    console.log("Date:", date);
    const result = await assistantService.findScheduleByDate(userId, date);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "bus list",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getScheduleByMonth = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { year, month } = req.query;
    const result = await assistantService.findAssistantScheduleByMonth(
      userId,
      year,
      month
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: 200,
      message: "bus schedule list for month",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
