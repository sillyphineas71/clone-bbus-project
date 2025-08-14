const admin = require("firebase-admin");
const serviceAccount = require("../config/firebaseConfig"); // Đường dẫn tới file của bạn
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
