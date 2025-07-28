const { Router } = require("express");
const routeService = require("../service/routeService");
exports.findAll = async (req, res, next) => {
  try {
    const {
      keyword = "",
      sort = "id: asc",
      page = 0,
      size = 10000,
    } = req.query;
    const result = await routeService.findAll(keyword, sort, page, size);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getRouteDetail = async (req, res, next) => {
  try {
    const routeId = req.params.routeId;
    const result = await routeService.findById(routeId);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
exports.getRouteByBusId = async (req, res, next) => {
  try {
    const busId = req.query.busId;
    const result = await routeService.getRoutePathByBusId(busId);
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

exports.createRoute = async (req, res, next) => {
  try {
    const newRoute = req.body;
    const result = await routeService.save(newRoute);
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
exports.updateRouteInfoAndCheckpoints = async (req, res, next) => {
  try {
    const routeUpdate = req.body;
    const result = await routeService.updateRouteInfoAndCheckpoints(
      routeUpdate
    );
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
exports.deleteRoute = async (req, res, next) => {
  try {
    const routeId = req.params.routeId;
    const result = await routeService.deleteRoute(routeId);
    if (result.status !== 201) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    return res.status(201).json({
      status: result.status,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
