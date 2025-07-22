const busService = require("../service/busService");

exports.getList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await busService.findAll(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
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
exports.getBusesByCheckpoint = async (req, res, next) => {
  try {
    const { checkpointId } = req.query;
    const result = await busService.findBusesByCheckpointId(checkpointId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getBusesByRouteId = async (req, res, next) => {
  try {
    const { routeId } = req.query;
    const result = await busService.getBusesByRouteId(routeId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getBusDetail = async (req, res, next) => {
  try {
    const busId = req.params.busId;
    const result = await busService.getBusById(busId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.createBus = async (req, res, next) => {
  try {
    const busData = req.body;
    const result = await busService.saveBus(busData);
    if (result.status !== 201) {
      return res.status(result.status).json({
        status: result.status,
        message: result.message,
      });
    }
    return res.status(201).json({
      status: 201,
      message: "Bus created successfully",
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
