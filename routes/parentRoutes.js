const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const parentController = require("../controller/parentController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadExcel = multer({ dest: "uploads/" });

//GET parent/student-list
router.get("/student-list", isAuth, parentController.getStudentListOfAParent);
//GET parent/list
router.get("/list", isAuth, parentController.getParentList);
//POST parent/register-checkpoint
router.post(
  "/register-checkpoint",
  isAuth,
  parentController.registerCheckpoint
);
//POST parent/register-checkpoint-for-all-children
router.post(
  "/register-checkpoint-for-all-children",
  isAuth,
  parentController.registerCheckpointForAllChildren
);
//PATH parent/checkpoint/register/one
router.patch(
  "/checkpoint/register/one",
  isAuth,
  parentController.upsertCheckpoint
);
//PATCH parent/checkpoint/register/all
router.patch(
  "/checkpoint/register/all",
  isAuth,
  parentController.upsertCheckpointForAllChildren
);
//PATCH parent/update-student-info
router.patch(
  "/update-student-info",
  isAuth,
  parentController.updateStudentInfo
);

module.exports = router;
