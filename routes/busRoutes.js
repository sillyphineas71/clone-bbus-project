const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const busController = require("../controller/busController");

//GET /bus/list
router.get(
  "/list",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.getList
);
//GET /bus/by-checkpoint/:checkpointId
router.get(
  "/by-checkpoint",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.getBusesByCheckpoint
);
//GET /bus//by-route
router.get(
  "/by-route",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.getBusesByRouteId
);
//GET /bus/:busId
router.get(
  "/:busId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.getBusDetail
);

//POST /bus/add
router.post(
  "/add",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.createBus
);
module.exports = router;
