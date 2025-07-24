const router = require("express").Router();
const authValidator = require("../validators/authValidators");
const busScheduleController = require("../controller/busScheduleController");

//GET /bus-schedule/list
router.get("/list", authValidator.isAuth, busScheduleController.getList);

//GET /bus-schedule/by-month
router.get("/by-month", authValidator.isAuth, busScheduleController.getByMonth);

//GET /bus-schedule/dates
router.get(
  "/dates",
  authValidator.isAuth,
  busScheduleController.getBusScheduleDatesByMonth
);

//POST /bus-schedule/assign-batch
router.post(
  "/assign-batch",
  authValidator.isAuth,
  busScheduleController.assignBusScheduleBatch
);

// DELETE /bus-schedule?date=...
router.delete(
  "/",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  busScheduleController.deleteSchedulesByDate
);

//POST /bus-schedule/complete
router.post(
  "/complete",
  authValidator.isAuth,
  authValidator.checkRole("ASSISTANT", "DRIVER", "ADMIN", "SYSADMIN"),
  busScheduleController.completeBusSchedule
);

module.exports = router;
