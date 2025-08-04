const admin = require("firebase-admin");
const serviceAccount = require("../config/clone-bbus-project-firebase-adminsdk-fbsvc-99f124a1fc.json"); // Đường dẫn tới file của bạn

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
