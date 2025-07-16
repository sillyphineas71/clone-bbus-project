class StudentUpdateByParentRequest {
  constructor({ studentId, name, dob, address }) {
    this.studentId = studentId; // Unique identifier for the student
    this.name = name; // Name of the student
    this.dob = dob; // Date of birth of the student
    this.address = address; // Address of the student
  }
}

module.exports = StudentUpdateByParentRequest;
