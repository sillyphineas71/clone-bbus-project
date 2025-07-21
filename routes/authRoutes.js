const router = require("express").Router();
const authController = require("../controller/authController");

//POST /auth/login
router.post("/login", authController.getAccessToken);

//POST /auth/refresh-token
router.post("/refresh-token", authController.getRefreshToken);

module.exports = router;
