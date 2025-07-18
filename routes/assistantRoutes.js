const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const assistantController = require("../controller/assistantController");

//GET /assistant/list
router.get("/list", isAuth, assistantController.getAssistantList);
//GET /assistant/available
router.get("/available", isAuth, assistantController.getAvailableAssistantList);
//GET /assistant/get-schedule
router.get("/get-schedule", isAuth, assistantController.getSchedule);
//GET /assistant/get-schedule-by-month
router.get(
  "/get-schedule-by-month",
  isAuth,
  assistantController.getScheduleByMonth
);

module.exports = router;
