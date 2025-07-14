const router = require("express").Router();
const authController = require("../controller/authController");

//POST /auth/login
router.post("/login", authController.getAccessToken);

module.exports = router;
