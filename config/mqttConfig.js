module.exports = {
  brokerUrl: process.env.MQTT_BROKER_URL || "",
  clientId: process.env.MQTT_CLIENT_ID || "",
  topic: process.env.MQTT_TOPIC || "",
  username: process.env.MQTT_USERNAME || "",
  password: process.env.MQTT_PASSWORD || "",
  clean: process.env.MQTT_CLEAN_SESSION === "",
  connectTimeout: parseInt(process.env.MQTT_CONNECTION_TIMEOUT) || 10 * 1000, // ms
  keepalive: parseInt(process.env.MQTT_KEEP_ALIVE) || 60, // seconds
};
