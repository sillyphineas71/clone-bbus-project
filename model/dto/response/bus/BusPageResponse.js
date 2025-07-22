const PageResponseAbstract = require("../PageResponseAbstract");
class BusPageResponse extends PageResponseAbstract {
  constructor(pageNumber, pageSize, totalPages, totalElements, buses = []) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.buses = buses; // Array of driver objects
  }
}
module.exports = BusPageResponse;
