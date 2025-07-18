const PageResponseAbstract = require("../PageResponseAbstract");
class DriverPageResponse extends PageResponseAbstract {
  constructor(pageNumber, pageSize, totalPages, totalElements, drivers = []) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.drivers = drivers; // Array of driver objects
  }
}
module.exports = DriverPageResponse;
