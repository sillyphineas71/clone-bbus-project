const { request } = require("express");
const requestService = require("../service/requestService");

exports.getList = (req, res, next) => {
  const { keyword, sort } = req.query;
  const page = parseInt(req.query.page, 10) || 0;
  const size = parseInt(req.query.size, 10) || 10000;

  console.log("Get request list");
  requestService
    .findAll(keyword, sort, page, size)
    .then((pageResponse) => {
      res.status(200).json({
        status: 200,
        message: "request list",
        data: pageResponse,
      });
    })
    .catch(next);
};

exports.getRequestDetail = (req, res, next) => {
  const id = req.params.requestId;
  requestService
    .findById(id)
    .then((detail) => {
      res.status(200).json({
        status: 200,
        message: "get request detail",
        data: detail,
      });
    })
    .catch(next);
};

exports.getMyRequests = (req, res, next) => {
  const requestTypeId = req.query.requestTypeId;
  const userId = req.userId;
  requestService
    .getMyRequests(userId, requestTypeId)
    .then((requestResponses) => {
      res.status(200).json({
        status: 200,
        message: "Get my requests successfully",
        data: requestResponses,
      });
    })
    .catch(next);
};

exports.createRequest = (req, res, next) => {
  const userId = req.userId;
  const payload = {
    studentId: req.body.studentId,
    sendByUserId: req.body.sendByUserId,
    requestTypeId: req.body.requestTypeId,
    checkpointId: req.body.checkpointId,
    reason: req.body.reason,
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
  };

  requestService
    .createRequest(userId, payload)
    .then((requestResponse) => {
      res.status(201).json({
        status: 201,
        message: "request created successfully",
        data: requestResponse,
      });
    })
    .catch(next);
};

exports.replyRequest = (req, res, next) => {
  const userId = req.userId;
  const payload = {
    requestId: req.body.requestId,
    approvedByUserId: req.body.approvedByUserId,
    reply: req.body.reply,
    status: req.body.status,
  };
  requestService
    .replyRequest(userId, payload)
    .then((replyResponse) => {
      res.status(201).json({
        status: 201,
        message: "reply request successfully",
        data: replyResponse,
      });
    })
    .catch(next);
};

exports.processChangeCheckpoint = (req, res, next) => {
  const userId = req.userId;
  requestService
    .processChangeCheckpointRequest(userId, req.params.requestId)
    .then((response) => {
      console.log(response);
      if (!response) {
        return res.status(400).json({
          status: 400,
          message: "Không có xe đủ chỗ để xử lý đơn",
        });
      }
      res.json({
        status: 200,
        message: "Đã xử lý đơn đổi điểm đón",
        data: response,
      });
    })
    .catch(next);
};
