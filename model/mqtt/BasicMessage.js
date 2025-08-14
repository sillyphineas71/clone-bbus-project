class Info {
  constructor(facesluiceId, username, time, ip, facesname) {
    this.facesluiceId = facesluiceId;
    this.username = username;
    this.time = time;
    this.ip = ip;
    this.facesname = facesname;
  }
}
class BasicMessage {
  constructor(topic, info) {
    this.topic = topic;
    this.info = new Info(
      info.facesluiceId,
      info.username,
      info.time,
      info.ip,
      info.facesname
    );
  }
}
module.exports = { BasicMessage, Info };
