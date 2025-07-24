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

//PUT /bus/upd
router.put(
  "/upd",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.updateBus
);

//PATCH /bus/status
router.patch(
  "/status",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.changeStatus
);

//POST bus/upd-max-capacity-for-all-bus
router.post(
  "/upd-max-capacity-for-all-bus",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  busController.updateMaxCapacityForAllBus
);
module.exports = router;
