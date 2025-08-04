const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const attendanceController = require("../controller/attendanceController");

//GET /attendance/get-attendance
router.get(
  "/get-attendance",
  isAuth,
  checkRole("SYSADMIN", "ADMIN", "DRIVER", "ASSISTANT"),
  attendanceController.getList
);

//GET /attendance/parent/:studentId
router.get(
  "/parent/:studentId",
  isAuth,
  checkRole("PARENT"),
  attendanceController.getAttendanceOfAStudentForParent
);

//PATCH /attendance/manual-attendance
router.patch(
  "/manual-attendance",
  isAuth,
  checkRole("SYSADMIN", "ADMIN", "ASSISTANT", "DRIVER"),
  attendanceController.manualAttendance
);

//GET /attendance/final-report
router.get(
  "/final-report",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getFinalReport
);

//GET /attendance/bus-report
router.get(
  "/bus-report",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getBusReport
);

//GET /attendance/route-report
router.get(
  "/route-report",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getRouteReport
);

//GET /attendance/attendance-report
router.get(
  "/attendance-report",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getAttendanceReport
);

//GET /attendance/driver-assistant-report
router.get(
  "/driver-assistant-report",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getDriverAndAssistantReport
);

//GET /attendance/dashboard
router.get(
  "/dashboard",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getDashboard
);

//GET /attendance/:studentId
router.get(
  "/:studentId",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  attendanceController.getAttendanceHistoryOfAStudent
);
module.exports = router;
