const admin = require("firebase-admin");
<<<<<<< HEAD
const serviceAccount = require("../config/clone-bbus-project-firebase-adminsdk-fbsvc-99f124a1fc.json"); // Đường dẫn tới file của bạn

=======
const serviceAccount = require("../config/firebaseConfig"); // Đường dẫn tới file của bạn
>>>>>>> backup-tai-branch
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
