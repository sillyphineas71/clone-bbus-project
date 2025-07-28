const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const requestTypeController = require("../controller/requestTypeController");

//GET /request-type/list
router.get("/list", isAuth, requestTypeController.findAll);

//GET /request-type/:{requestTypeId}
router.get(
  "/:requestTypeId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  requestTypeController.getRequestTypeDetail
);
module.exports = router;
