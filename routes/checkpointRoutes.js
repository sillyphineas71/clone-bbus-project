const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const checkpointController = require("../controller/checkpointController");

//GET /checkpoint/list
router.get("/list", isAuth, checkpointController.getList);

//GET /checkpoint/students
router.get(
  "/students",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  checkpointController.getStudentsByCheckpoint
);

//PATCH /checkpoint/:checkpointId/toggle-status
router.patch(
  "/:checkpointId/toggle-status",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.toggleCheckpointStatus
);

//GET /checkpoint/by-route
router.get(
  "/by-route",
  isAuth,
  checkRole("SYSADMIN", "ADMIN", "DRIVER", "ASSISTANT", "PARENT"),
  checkpointController.getCheckpointsByRoute
);

//GET /checkpoint/no-route
router.get(
  "/no-route",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.getCheckpointsWithoutRoute
);

//GET /checkpoint/have-route
router.get("/have-route", isAuth, checkpointController.getCheckpointsWithRoute);

//GET /checkpoint/count-students
router.get(
  "/count-students",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.countStudentsInCheckpoint
);

//POST /checkpoint/add
router.post(
  "/add",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.createCheckpoint
);

//PUT /checkpoint/upd
router.put(
  "/upd",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.editCheckpoint
);

//PATCH /checkpoint/status
router.patch(
  "/status",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.changeStatus
);
//GET /checkpoint/list-with-registered
router.get(
  "/list-with-registered",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  checkpointController.getListWithRegistered
);

//GET /checkpoint/detailed-with-student-and-bus
router.get(
  "/detailed-with-student-and-bus",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.getDetailedWithStudentAndBus
);

//GET /checkpoint/get-an-checkpoint-with-student-count
router.get(
  "/get-an-checkpoint-with-student-count",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.getAnCheckpointWithStudentCount
);

//GET /checkpoint/:checkpointId
router.get("/:checkpointId", isAuth, checkpointController.getCheckpointDetail);
//DELETE /checkpoint/:checkpointId
router.delete(
  "/:checkpointId",
  isAuth,
  checkRole("SYSADMIN", "ADMIN"),
  checkpointController.deleteCheckpoint
);
module.exports = router;
