const router = require("express").Router();
const authValidator = require("../validators/authValidators");
const eventController = require("../controller/eventController");

// GET /event/:eventName
router.get(
  "/:eventName",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN", "PARENT"),
  eventController.getEventDetail
);

// POST /event/add
router.post(
  "/add",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  eventController.createEvent
);

// PUT /event/upd           -- Chưa xong --
router.put(
  "/upd",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  eventController.editEvent
);

// DELETE /event/:eventName
router.delete(
  "/:eventName",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  eventController.deleteEvent
);

module.exports = router;
