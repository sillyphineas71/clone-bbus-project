class CheckpointWithStudentResponse {
  constructor(studentId, studentName, rollNumber, registered, busId, busName) {
    this.studentId = studentId;
    this.studentName = studentName;
    this.rollNumber = rollNumber;
    this.registered = registered;
    this.busId = busId;
    this.busName = busName;
  }
}
module.exports = CheckpointWithStudentResponse;
