class busCreateRequest {
  constructor(licensePlate, name, assistantPhone, driverPhone, route) {
    this.licensePlate = licensePlate; // License plate of the bus
    this.name = name; // Name of the bus
    this.assistantPhone = assistantPhone; // Phone number of the assistant
    this.driverPhone = driverPhone; // Phone number of the driver
    this.route = route; // Route associated with the bus
  }
}
module.exports = busCreateRequest;
