class CheckpointWithStudentAndBusRequest {
  constructor(checkpointId, checkpointName, students, buses, status) {
    this.checkpointId = checkpointId;
    this.checkpointName = checkpointName;
    this.students = students;
    this.buses = buses;
    this.status = status;
  }
}
module.exports = CheckpointWithStudentAndBusRequest;
