const router = require("express").Router();
const studentController = require("../controller/studentController");
const authValidator = require("../validators/authValidators");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

//GET /student/list
router.get("/list", studentController.getList);

//GET /student/by-bus
router.get(
  "/by-bus",
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  studentController.getStudentsByBusId
);

//GET /student/:studentId
router.get(
  "/:studentId",
  authValidator.isAuth,
  studentController.getStudentDetail
);

//POST /student/add
router.post(
  "/add",
  authValidator.isAuth,
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  upload.array("avatar"),
  studentController.createStudent
);

//PUT /student/upd
router.put("/upd", authValidator.isAuth, studentController.updateStudent);

// PATCH /student/change-status
router.patch(
  "/change-status",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  studentController.changeStatus
);

module.exports = router;
