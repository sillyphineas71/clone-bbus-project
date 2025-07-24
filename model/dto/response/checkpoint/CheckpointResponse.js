class CheckPointResponse {
  constructor(id, name, description, latitude, longitude, status) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
  }
}
module.exports = CheckPointResponse;
