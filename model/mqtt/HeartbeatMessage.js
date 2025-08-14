class Info {
  constructor(facesluiceId, time) {
    this.facesluiceId = facesluiceId;
    this.time = time;
  }
}
class HeartbeatMessage {
  constructor(operation, info) {
    this.operation = operation;
    this.info = new Info(info.facesluiceId, info.time);
  }
}
module.exports = { HeartbeatMessage, Info };
