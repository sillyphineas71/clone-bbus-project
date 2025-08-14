const mqttClient = require("../util/mqttClient");
const busService = require("../services/busService");
const topic = process.env.MQTT_TOPIC;
const cameraService = require("../services/cameraService");
const HeartbeatMessage = require("../model/mqtt/HeartbeatMessage");
const AttendanceMessage = require("../model/mqtt/AttendanceMessage");
const ResultMessage = require("../model/mqtt/ResultMessage");
const BusLocationMessage = require("../model/mqtt/BusLocationMessage");
const mqttService = require("../service/MqttServiceImpl");
exports.subcribe = async () => {
  if (!mqttClient.connected) {
    throw new Error("MQTT client is not connected");
  }
  mqttClient.subscribe(topic, (topicReceived, message) => {
    const payload = message.toString();
    if (topicReceived.startWith("mqtt/face/basic")) {
      const heartbeatMeassage = new HeartbeatMessage(JSON.parse(payload));
      cameraService.handleBasicMessage(heartbeatMeassage);
    } else if (topicReceived.matches("mqtt/face/\\d+/Rec")) {
      const attendanceMessage = new AttendanceMessage(JSON.parse(payload));
      mqttService.handleAttendanceMessage(attendanceMessage, topicReceived);
    } else if (topicReceived.matches("mqtt/face/\\d+/Ack")) {
      const resultMessage = new ResultMessage(JSON.parse(payload));
      mqttService.handleResultMessage(resultMessage, topicReceived);
    } else if (topicReceive.matches("mqtt/gps/\\d+/location")) {
      const busLocationMessage = new BusLocationMessage(JSON.parse(payload));
      busService.handleBusLocationMessage(busLocationMessage, topicReceived);
    } else {
      console.warn(`Unknown topic received: ${topicReceived}`);
      console.warn("Message payload:", payload);
    }
  });
  console.log(`Subscribed to topic: ${topic}`);
};
