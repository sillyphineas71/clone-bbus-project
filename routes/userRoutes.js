const router = require("express").Router();
const { isAuth } = require("../validators/authValidators");
const userController = require("../controller/userController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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

//PATCH /user/change-status
router.patch("/change-status", userController.changeStatus);
module.exports = router;
