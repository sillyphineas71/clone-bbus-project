class RouteResponseUpdate {
  constructor(id, code, description, checkpoints, orderedCheckpointTimes) {
    this.id = id;
    this.code = code;
    this.description = description;
    this.checkpoints = checkpoints;
    this.orderedCheckpointTimes = orderedCheckpointTimes;
  }
}
module.exports = RouteResponseUpdate;
