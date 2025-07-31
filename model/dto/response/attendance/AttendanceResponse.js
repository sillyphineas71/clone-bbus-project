const moment = require("moment-timezone");

class AttendanceResponse {
  constructor(attendance) {
    this.id = attendance.id;
    this.studentId = attendance.student?.id || null;
    this.rollNumber = attendance.student?.roll_number || null;
    this.studentName = attendance.student?.name || null;
    this.dob = attendance.student?.dob || null;
    this.avatarUrl = attendance.student?.avatarUrl || null;
    this.direction = attendance.direction;
    this.status = attendance.status;

    this.checkin = attendance.checkin
      ? moment(attendance.checkin)
          .tz("Asia/Ho_Chi_Minh")
          .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      : null;

    this.checkout = attendance.checkout
      ? moment(attendance.checkout)
          .tz("Asia/Ho_Chi_Minh")
          .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      : null;

    this.checkpointId = attendance.checkpoint?.id || null;
    this.checkpointName = attendance.checkpoint?.name || null;

    this.parentName = attendance.student?.parent?.user?.name || null;
    this.parentPhone = attendance.student?.parent?.user?.phone || null;
  }
}

module.exports = AttendanceResponse;
