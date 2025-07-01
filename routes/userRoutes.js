const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const userController = require("../controller/userController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

//GET /user/list
router.get("/list", userController.getUserList);

//GET /{userId}
router.get("/:userId", userController.getUserById);

//POST /user/add
router.post("/add", userController.createUser);

//POST /upload-image
router.post(
  "/upload-image",
  upload.array("avatars"),
  userController.uploadImage
);

module.exports = router;
