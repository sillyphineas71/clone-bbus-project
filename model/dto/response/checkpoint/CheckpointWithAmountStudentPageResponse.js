const PageResponseAbstract = require("../PageResponseAbstract");
class CheckpointWithAmountStudentPageResponse extends PageResponseAbstract {
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
module.exports = CheckpointWithAmountStudentPageResponse;
