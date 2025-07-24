class CheckpointCreationRequest {
  constructor(checkpointName, description, latitude, longitude) {
    this.checkpointName = checkpointName;
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
module.exports = CheckpointCreationRequest;
