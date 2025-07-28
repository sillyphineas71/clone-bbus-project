const PageResponseAbstract = require("../PageResponseAbstract");
class RequestTypePageResponse extends PageResponseAbstract {
  constructor(
    pageNumber,
    pageSize,
    totalPages,
    totalElements,
    requestType = []
  ) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.requestType = requestType;
  }
}
module.exports = RequestTypePageResponse;
