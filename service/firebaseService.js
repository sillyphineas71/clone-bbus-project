const firebase = require("../util/firebase");

class FirebaseMessagingService {
  constructor() {
    this.firebaseFileName = process.env.FILEBASE_FILE_NAME;
  }

  initialize() {
    try {
      const filePath = path.resolve(__dirname, this.firebaseFileName);
      const serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase initialized");
      }
    } catch (error) {
      console.error("❌ Firebase init failed:", error.message);
    }
  }

  // Gửi đến 1 thiết bị
  async sendNotificationToSpecificUser(token, title, body) {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("✅ Sent to user:", response);
    } catch (error) {
      console.error("❌ Firebase send error:", error.message);
    }
  }

  // Gửi đến danh sách thiết bị (theo token)
  async sendNotificationToMultipleUsers(tokens, title, body) {
    for (const token of tokens) {
      await this.sendNotificationToSpecificUser(token, title, body);
    }
  }

  // Gửi đến tất cả thiết bị đăng ký topic "all"
  async sendToAllDevices(title, body) {
    const message = {
      topic: "all",
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("✅ Sent to topic 'all':", response);
    } catch (error) {
      console.error("❌ Firebase send to topic failed:", error.message);
    }
  }
}

module.exports = new FirebaseMessagingService();
