const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const parentController = require("../controller/parentController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadExcel = multer({ dest: "uploads/" });

//GET parent/student-list
router.get("/student-list", parentController.getStudentListOfAParent);
//GET parent/list
router.get("/list", parentController.getParentList);
module.exports = router;
