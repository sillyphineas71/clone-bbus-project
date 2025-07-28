const PageResponseAbstract = require("../PageResponseAbstract");
class RoutePageResponse extends PageResponseAbstract {
  constructor(pageNumber, pageSize, totalPages, totalElements, routes = []) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.routes = routes;
  }
}
module.exports = RoutePageResponse;
