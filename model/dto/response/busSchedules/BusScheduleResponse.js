class BusScheduleResponse {
  constructor(busSchedule) {
    this.id = busSchedule.id;
    this.busId = busSchedule.bus_id || null;
    this.name = busSchedule.bus.name || null;
    this.licensePlate = busSchedule.bus?.license_plate || null;
    this.date = busSchedule.date;
    this.driverId = busSchedule.driver?.user?.id || null;
    this.driverName = busSchedule.driver?.user?.name || null;
    this.assistantId = busSchedule.assistant?.user?.id || null;
    this.assistantName = busSchedule.assistant?.user?.name || null;
    this.route = busSchedule.route?.code || null;
    this.routeId = busSchedule.route?.id || null;
    this.direction = busSchedule.direction || null;
    this.createdAt = busSchedule.createdAt;
    this.updatedAt = busSchedule.updatedAt;
    this.busScheduleStatus = busSchedule.busScheduleStatus;
  }
}

module.exports = BusScheduleResponse;
