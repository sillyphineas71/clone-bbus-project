const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const cameraRequestController = require("../controller/cameraRequestController");

//GET /camera-request/list
router.get(
  "/list",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  cameraRequestController.getList
);

//GET /camera-request/add
router.get(
  "/add",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  cameraRequestController.createCameraRequest
);

//GET /camera-request/:{cameraRequestId}
router.get(
  "/:cameraRequestId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  cameraRequestController.getCameraRequestDetail
);

module.exports = router;
