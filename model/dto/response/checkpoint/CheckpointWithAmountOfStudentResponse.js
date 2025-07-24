class CheckpointWithAmountOfStudentResponse {
  constructor(
    id,
    name,
    description,
    latitude,
    longitude,
    status,
    amountOfStudent
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.amountOfStudent = amountOfStudent;
  }
}
module.exports = CheckpointWithAmountOfStudentResponse;
