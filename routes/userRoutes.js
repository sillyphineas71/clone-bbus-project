const router = require("express").Router();
const { isAuth } = require("../validators/authValidators");
const userController = require("../controller/userController");

//GET /user/list
router.get("/list", userController.getUserList);

//GET /{userId}
router.get("/:userId", userController.getUserById);

module.exports = router;
