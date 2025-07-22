const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const driverController = require("../controller/driverController");

//GET /driver/list
router.get("/list", isAuth, driverController.getDriverList);

//GET /driver/available
router.get("/available", isAuth, driverController.getAvailableDriverList);

//GET /driver/get-schedule
router.get("/get-schedule", isAuth, driverController.getSchedule);

//GET driver/get-schedule-by-month
router.get(
  "/get-schedule-by-month",
  isAuth,
  driverController.getDriverScheduleByMonth
);
module.exports = router;
