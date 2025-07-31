const PageResponseAbstract = require("../PageResponseAbstract");
class CameraRequestPageResponse extends PageResponseAbstract {
  constructor(pageNumber, pageSize, totalPages, totalElements, cameras = []) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.cameras = cameras;
  }
}
module.exports = CameraRequestPageResponse;
