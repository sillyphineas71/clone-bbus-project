const cameraRequestService = require("../service/cameraRequestService");

exports.getList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await cameraRequestService.findAll(
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
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

exports.getCameraRequestDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await cameraRequestService.findById(id);
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
exports.createCameraRequest = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await cameraRequestService.save(data);
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
