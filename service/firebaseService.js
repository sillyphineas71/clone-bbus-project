const firebase = require("../util/firebase");

exports.sendNotificationToSpecificUser = async (token, title, body) => {
  try {
    const message = {
      token: token, //lay token o html neu can test
      notification: {
        title: title,
        body: body,
      },
    };

    // Gửi message
    const response = await firebase.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Firebase failed: ", error);
    throw error;
  }
};
