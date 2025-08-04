const studentService = require("../service/studentService");
const requestService = require("../service/requestService");
const userService = require("../service/userService");
const routeService = require("../service/routeService");
const { request } = require("express");

module.exports.countTotalStudents = (req, res, next) => {
  studentService.countTotalStudents().then((count) => {
    if (!count) {
      const err = new Error("No students found");
      err.statusCode = 404;
      next(err);
    }
    res.status(200).json({
      status: 200,
      message: "count total students",
      totalStudents: count,
    });
  });
};

module.exports.getRequestStats = (req, res, next) => {
  const data = [];
  requestService
    .countPendingRequests()
    .then((pendingRequests) => {
      if (!pendingRequests) {
        const err = new Error("No pending requests found");
        err.statusCode = 404;
        next(err);
      } else {
        data.push(pendingRequests);
      }
      return requestService.countTotalRequests();
    })
    .then((totalRequest) => {
      if (!totalRequest) {
        const err = new Error("No total requests found");
        err.statusCode = 404;
        next(err);
      } else {
        data.push(totalRequest);
      }
      res.status(200).json({
        status: 200,
        message: "Request statistics",
        data: {
          totalRequests: data[1],
          pendingRequests: data[0],
        },
      });
    });
};

module.exports.getUserStats = (req, res, next) => {
  const data = [];
  userService
    .countInactiveUsers()
    .then((inactiveUsers) => {
      if (!inactiveUsers) {
        const err = new Error("No users found");
        err.statusCode = 404;
        next(err);
      } else {
        data.push(inactiveUsers);
      }
      return userService.countActiveUsers();
    })
    .then((activeUsers) => {
      if (!activeUsers) {
        const err = new Error("No active users found");
        err.statusCode = 404;
        next(err);
      } else {
        data.push(activeUsers);
      }
      return userService.countTotalUsers();
    })
    .then((totalUsers) => {
      if (!totalUsers) {
        const err = new Error("No total users found");
        err.statusCode = 404;
        next(err);
      } else {
        data.push(totalUsers);
      }
      res.status(200).json({
        status: 200,
        message: "User account statistics",
        data: {
          inactiveUsers: data[0],
          activeUsers: data[1],
          totalUsers: data[2],
        },
      });
    });
};

exports.countTotalBusRoutes = (req, res, next) => {
  routeService.countTotalRoutes().then((count) => {
    if (count === 0) {
      const err = new Error("No bus routes found");
      err.statusCode = 404;
      next(err);
    } else {
      res.status(200).json({
        status: 200,
        message: "Count total bus routes",
        data: count,
      });
    }
  });
};
