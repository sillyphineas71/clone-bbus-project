const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const requestController = require("../controller/requestController");

//GET request/list
router.get("/list", isAuth, requestController.getList);

// GET /request/my-requests
router.get(
  "/my-requests",
  isAuth,
  checkRole("SYSADMIN", "ADMIN", "PARENT", "TEACHER", "DRIVER", "ASSISTANT"),
  requestController.getMyRequests
);

// POST /request/add
router.post(
  "/add",
  isAuth,
  checkRole("PARENT"),
  requestController.createRequest
);

// PATCH /request/reply
router.patch(
  "/reply",
  isAuth,
  checkRole("PARENT", "ADMIN", "SYSADMIN"),
  requestController.replyRequest
);

// POST /request/process-change-checkpoint/{requestId}
router.post(
  "/process-change-checkpoint/:requestId",
  isAuth,
  checkRole("ADMIN", "SYSADMIN"),
  requestController.processChangeCheckpoint
);

// GET /request/:requestId
router.get("/:requestId", isAuth, requestController.getRequestDetail);

module.exports = router;
