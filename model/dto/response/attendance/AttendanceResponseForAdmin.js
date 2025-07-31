class AttendanceResponseForAdmin {
  constructor(
    id,
    driverName,
    assistantName,
    date,
    routeCode,
    routeDescription,
    direction,
    status,
    checkin,
    checkout,
    checkpointName,
    modifiedBy
  ) {
    this.id = id;
    this.driverName = driverName;
    this.assistantName = assistantName;
    this.date = date;
    this.routeCode = routeCode;
    this.routeDescription = routeDescription;
    this.direction = direction;
    this.status = status;
    this.checkin = checkin;
    this.checkout = checkout;
    this.checkpointName = checkpointName;
    this.modifiedBy = modifiedBy;
  }
}
module.exports = AttendanceResponseForAdmin;
