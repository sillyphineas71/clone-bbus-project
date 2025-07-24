const PageResponseAbstract = require("../PageResponseAbstract");
class CheckpointPageResponse extends PageResponseAbstract {
  constructor(
    pageNumber,
    pageSize,
    totalPages,
    totalElements,
    checkpoints = []
  ) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.checkpoints = checkpoints;
  }
}
module.exports = CheckpointPageResponse;
