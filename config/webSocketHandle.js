const url = require("url");
const WebSocket = require("ws");
const { format } = require("date-fns");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const mqttPublisherService = require("../mqtt/MqttPublisherService");
const attendanceService = require("../service/attendanceService");
const topicSessions = new Map();
const TOPIC_MQTT_ACTIVE = "mqtt/gps/{espId}/active";
const TOPIC_SOCKET_STUDENT_STATUS = "/student-status";

const ActiveGpsModuleMessage = require("../model/mqtt/ActiveGpsModuleMessage");
const { is } = require("date-fns/locale");
const session = require("express-session");

function extractTopic(url) {
  const perfix = "/ws/";
  const index = url.indexOf(perfix);
  if (index === -1) {
    throw new Error("Invalid URL: missing /ws/ prefix");
  }
  return path.substring(index + perfix.length);
}
function activeGpsModule(topic) {
  try {
    topic = TOPIC_MQTT_ACTIVE.replace("{espId}", topic);
    const payload = new ActiveGpsModuleMessage(true);
    mqttPublisherService.publishMessageCustomTopic(topic, payload);
  } catch (e) {
    throw new Error(
      "Error occurred while publishing MQTT message for topic {}: {}",
      topic,
      e.message
    );
  }
}

function inActiveGpsModule(topic) {
  try {
    topic = TOPIC_MQTT_ACTIVE.replace("{espId}", topic);
    const payload = new ActiveGpsModuleMessage(false);
    mqttPublisherService.publishMessageCustomTopic(topic, payload);
  } catch (e) {
    throw new Error(
      "Error occurred while publishing MQTT message for topic {}: {}",
      topic,
      e.message
    );
  }
}

async function publishCurrentStudentStatus(topic) {
  const parts = topic.split("/");
  const busId = parts[0];
  if (!isUuid(busId)) {
    throw new Error("Invalid bus ID in topic: " + topic);
  }
  const stringDirection = parts[1];
  const busDirection = "0" === String(stringDirection) ? "PICK_UP" : "DROP_OFF";
  if ("0" !== String(stringDirection) && "1" !== String(stringDirection)) {
    throw new Error("Direction is invalid");
  }

  const currentDate = format(new Date(), "yyyy-MM-dd");
  const attendances =
    await attendanceService.findAllByStudent_Checkpoint_Route_BusSchedules_Bus_IdAndDirectionAndDate(
      busId,
      busDirection,
      currentDate
    );
  if (!attendances) {
    throw new Error(
      `No attendance data found for busId: ${busId} and direction: ${direction}`
    );
  }
  const attendanceDTO = attendances.map((item) => {
    return {
      studentId: item.sutdent_id,
      date: item.date,
      direction: item.direction,
      checkpointId: item.checkpoint_id,
      busId: item.bus_id,
      status: item.status,
      checkin: item.checkin,
      checkout: item.checkout,
    };
  });
  broadcast(topic, JSON.stringify(attendanceDTO));
}
exports.publishStudentStatus = async (topic, attendanceResponse) => {
  broadcast(topic, JSON.stringify(attendanceResponse));
};
exports.broadcast = (topic, message) => {
  const sessions = topicSessions.get(topic);
  if (!sessions) return;

  for (const ws of sessions) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(message);
      } catch (err) {
        console.error(`Error sending message to topic ${topic}:`, err.message);
      }
    }
  }
};

exports.afterConnectionEstablished = async (ws, req) => {
  const topic = extractTopic(req.url);
  if (!topicSessions.has(topic)) {
    topicSessions.set(topic, new Set());
  }
  const sessions = topicSessions.get(topic);

  if (topic.length === 6) {
    const previousSize = sessions.size;
    sessions.add(ws);
    const currentSize = sessions.size;
    if (previousSize === 0 && currentSize === 1) {
      activeGpsModule(topic);
    }
  }
  if (topic.endWith(TOPIC_SOCKET_STUDENT_STATUS)) {
    sessions.add(ws);
    await publishCurrentStudentStatus(topic);
  }
  ws.send(`Connected to topic: ${topic}`);
  console.log(`Session ${req.url} connnected to the topic: ${topic}`);
};

exports.afterConnectionClosed = async (ws, req) => {
  const topic = extractTopic(req.url);
  const sessions = topicSessions.get(topic);

  if (topic.length === 6) {
    if (sessions) {
      sessions.delete(ws);
      const currentSize = sessions.size;

      if (currentSize === 0) {
        inActiveGpsModule(topic); // 1 → 0
        topicSessions.delete(topic);
      }
    }
  }

  console.log(
    `Session ${ws._socket.remoteAddress} disconnected from topic ${topic}`
  );
};
