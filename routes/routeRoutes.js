const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const routeController = require("../controller/routeController");

//GET /route/list
router.get(
  "/list",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.findAll
);

//GET /route/by-bus
router.get(
  "/by-bus",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.getRouteByBusId
);

//POST /route/add
router.post(
  "/add",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.createRoute
);

//PATCH /route/update-info-and-checkpoints
router.patch(
  "/update-info-and-checkpoints",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.updateRouteInfoAndCheckpoints
);
//GET /route/{routeId}
router.get(
  "/:routeId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.getRouteDetail
);
//DELETE /route/{routeId}
router.delete(
  "/:routeId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  routeController.deleteRoute
);

module.exports = router;
