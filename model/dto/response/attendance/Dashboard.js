class AttendanceRate {
  constructor(percentage, month) {
    this.percentage = percentage;
    this.month = month;
  }
}

class DashBoard {
  constructor(
    totalActiveStudent,
    totalActiveRoute,
    totalActiveUser,
    attendanceRate
  ) {
    this.totalActiveStudent = totalActiveStudent;
    this.totalActiveRoute = totalActiveRoute;
    this.totalActiveUser = totalActiveUser;
    this.attendanceRate = attendanceRate; // Mảng các đối tượng AttendanceRate
  }
}

module.exports = { DashBoard, AttendanceRate };
