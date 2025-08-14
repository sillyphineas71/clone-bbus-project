const mqtt = require("mqtt");
const config = require("../config/mqttConfig");
console.log(config);
const options = {
  clientId: config.clientId,
  clean: config.clean,
  connectTimeout: config.connectTimeout,
  keepalive: config.keepalive,
};
console.log("MQTT options:", options);
if (config.username && config.password) {
  options.username = config.username;
  options.password = config.password;
}

const client = mqtt.connect(config.brokerUrl, options);

client.on("connect", () => {
  console.log("✅ MQTT connected to:", config.brokerUrl);
});

client.on("error", (err) => {
  console.error("❌ MQTT connection error:", err.message);
});

module.exports = client;
