const router = require("express").Router();
const studentController = require("../controller/studentController");
const authValidator = require("../validators/authValidators");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadExcel = multer({ dest: "uploads/" });
//GET /student/list
router.get("/list", studentController.getList);

//GET /student/by-bus
router.get(
  "/by-bus",
  authValidator.checkRole("ADMIN", "SYSADMIN"),
  studentController.getStudentsByBusId
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
//POST /student/import
router.post(
  "/import",
  upload.single("file"),
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  studentController.importStudents
);

//PATCH /student/update-avatar
router.patch(
  "/update-avatar",
  authValidator.isAuth,
  authValidator.checkRole("SYSADMIN", "ADMIN"),
  upload.single("avatar"),
  studentController.updateAvatar
);
//GET /student/:studentId
router.get(
  "/:studentId",
  authValidator.isAuth,
  studentController.getStudentDetail
);
module.exports = router;
