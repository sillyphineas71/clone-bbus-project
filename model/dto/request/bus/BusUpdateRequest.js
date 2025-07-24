class BusUpdateRequest {
  constructor(id, licensePlate, assistantPhone, driverPhone) {
    this.id = id;
    this.licensePlate = licensePlate;
    this.assistantPhone = assistantPhone;
    this.driverPhone = driverPhone;
  }
}
module.exports = BusUpdateRequest;
