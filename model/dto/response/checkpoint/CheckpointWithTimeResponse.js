class CheckpointWithTimeResponse {
  constructor(id, name, description, latitude, longitude, status, time) {
    (this.id = id),
      (this.name = name),
      (this.description = description),
      (this.latitude = latitude),
      (this.longitude = longitude),
      (this.status = status),
      (this.time = time);
  }
}
module.exports = CheckpointWithTimeResponse;
