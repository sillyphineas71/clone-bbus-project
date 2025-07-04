const router = require("express").Router();
const { isAuth, checkRole } = require("../validators/authValidators");
const userController = require("../controller/userController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadExcel = multer({ dest: "uploads/" });
//GET /user/list
router.get("/list", userController.getUserList);

//GET /{userId}
router.get("/:userId", userController.getUserById);

//POST /user/add
router.post("/add", userController.createUser);

//POST /user/import
router.post("/import", uploadExcel.single("file"), userController.importUsers);

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

//PATCH /change-status
router.patch("/change-status", userController.changeStatus);

//DELETE /del/{userId}
router.delete("/del/:userId", userController.deleteUser);

//GET /entity/{userId}
router.get("/entity/:userId", userController.getEntityByUserId);
module.exports = router;
