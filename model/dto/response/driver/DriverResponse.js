class DriverResponse {
  constructor(id, name, phone, email, address, avatar, gender, dob, status) {
    this.id = id; // Unique identifier for the driver
    this.name = name; // Name of the driver
    this.phone = phone; // Phone number of the driver
    this.email = email; // Email address of the driver
    this.address = address; // Address of the driver
    this.avatar = avatar; // Avatar image URL of the driver
    this.gender = gender;
    this.dob = dob; // Date of birth of the driver
    this.status = status; // Status of the driver (e.g., active, inactive)
  }
}
module.exports = DriverResponse;
