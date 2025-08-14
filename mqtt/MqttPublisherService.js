const mqttClient = require("../util/mqttClient");

exports.publishMessage = async (topic, payload) => {
  const frontTopic = "mqtt/face";
  const jsonMessage = JSON.stringify(payload);
  try {
    mqttClient.publish(frontTopic + topic, jsonMessage, {
      qos: 1,
      retain: false,
    });
    console.log(`✅ Message published to ${frontTopic}:`, jsonMessage);
  } catch (error) {
    console.error(
      `❌ Failed to publish message to ${frontTopic}:`,
      error.message
    );
  }
};

exports.publishMessageCustomTopic = async (topic, payload) => {
  const jsonMessage = JSON.stringify(payload);
  try {
    mqttClient.publish(topic, jsonMessage, {
      qos: 1,
      retain: false,
    });
    console.log(`✅ Message published to ${frontTopic}:`, jsonMessage);
  } catch (error) {
    console.error(
      `❌ Failed to publish message to ${frontTopic}:`,
      error.message
    );
  }
};
