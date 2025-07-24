const checkpointService = require("../service/checkpointService");

exports.getList = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await checkpointService.findAll(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
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
exports.getStudentsByCheckpoint = async (req, res, next) => {
  try {
    const checkpointId = req.query.checkpointId;
    const result = await checkpointService.getStudentsByCheckpoint(
      checkpointId
    );
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
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
exports.toggleCheckpointStatus = async (req, res, next) => {
  try {
    const checkpointId = req.params.checkpointId;
    const result = await checkpointService.toggleCheckpointStatus(checkpointId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getCheckpointsByRoute = async (req, res, next) => {
  try {
    const routeId = req.query.routeId;
    const result = await checkpointService.getCheckpointsByRoute(routeId);
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

exports.getCheckpointsWithoutRoute = async (req, res, next) => {
  try {
    const result = await checkpointService.getCheckpointsWithoutRoute();
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
exports.getCheckpointsWithRoute = async (req, res, next) => {
  try {
    const result = await checkpointService.getCheckpointsWithRoute();
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
exports.countStudentsInCheckpoint = async (req, res, next) => {
  try {
    const checkpointId = req.query.checkpointId;
    const result = await checkpointService.countStudentsInCheckpoint(
      checkpointId
    );
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

exports.getCheckpointDetail = async (req, res, next) => {
  try {
    const checkpointId = req.params.checkpointId;
    const result = await checkpointService.getCheckpointDetail(checkpointId);
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
exports.createCheckpoint = async (req, res, next) => {
  try {
    const checkpointData = req.body;
    const result = await checkpointService.save(checkpointData);
    if (result.status !== 201) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(201).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.editCheckpoint = async (req, res, next) => {
  try {
    const checkpointData = req.body;
    const result = await checkpointService.update(checkpointData);
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
exports.changeStatus = async (req, res, next) => {
  try {
    const checkpointDataChangeStatus = req.body;
    const result = await checkpointService.changeStatus(
      checkpointDataChangeStatus
    );
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.deleteCheckpoint = async (req, res, next) => {
  try {
    const checkpointId = req.params.checkpointId;
    const result = await checkpointService.deleteCheckpoint(checkpointId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(200).json({
      status: result.status,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getListWithRegistered = async (req, res, next) => {
  try {
    const keyword = req.query.keyword;
    const result = await checkpointService.findAllWithAmountOfStudentRegister(
      keyword
    );
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
exports.getDetailedWithStudentAndBus = async (req, res, next) => {
  try {
    const checkpointId = req.query.checkpointId;
    const result = await checkpointService.getDetailedWithStudentAndBus(
      checkpointId
    );
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
exports.getAnCheckpointWithStudentCount = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 100000,
    } = req.query;
    const result = await checkpointService.getAnCheckpointWithStudentCount(
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
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
