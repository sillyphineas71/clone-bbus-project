const PageResponseAbstract = require("../PageResponseAbstract");
class AssistantPageResponse extends PageResponseAbstract {
  constructor(
    pageNumber,
    pageSize,
    totalPages,
    totalElements,
    assistants = []
  ) {
    super(pageNumber, pageSize, totalPages, totalElements);
    this.assistants = assistants; // Array of driver objects
  }
}
module.exports = AssistantPageResponse;
