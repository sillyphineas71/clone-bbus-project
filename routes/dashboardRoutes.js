const router = require("express").Router();
const dashboardController = require("../controller/dashboardController");
const authValidator = require("../validators/authValidators");

//GET /dashboard/count-total-student
router.get(
  "/count-total-student",
  authValidator.isAuth,
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  dashboardController.countTotalStudents
);

//GET /dashboard/request-stats
router.get(
  "/request-stats",
  authValidator.isAuth,
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  dashboardController.getRequestStats
);

//GET /dashboard/user-stats
router.get(
  "/user-stats",
  authValidator.isAuth,
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  dashboardController.getUserStats
);

//GET /dashboard/count-total-routes
router.get(
  "/count-total-routes",
  authValidator.isAuth,
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  dashboardController.countTotalBusRoutes
);

module.exports = router;
