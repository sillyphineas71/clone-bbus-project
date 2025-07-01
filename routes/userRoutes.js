const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const userController = require("../controller/userController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }, { dest: "uploads/" });

//GET /user/list
router.get("/list", userController.getUserList);

//GET /{userId}
router.get("/:userId", userController.getUserById);

//POST /user/add
router.post("/add", userController.createUser);


//POST /user/import
router.post("/import", upload.single("file"), userController.importUsers);

//PUT /user/upd
router.put("/upd", userController.updateUser);

//PATCH /user/change-pwd
router.patch("/change-pwd", userController.changePassword);

//POST /upload-image
router.post(
  "/upload-image",
  upload.array("avatars"),
  userController.uploadImage
);


//PATCH /user/change-status
router.patch("/change-status", userController.changeStatus);
module.exports = router;
