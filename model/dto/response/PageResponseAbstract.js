class PageResponseAbstract {
  constructor(pageNumber, pageSize, totalPages, totalElements) {
    this.pageNumber = parseInt(pageNumber); // Current page number
    this.pageSize = parseInt(pageSize); // Number of items per page
    this.totalPages = totalPages; // Total number of pages available
    this.totalElements = totalElements; // Total number of elements across all pages
  }
}
module.exports = PageResponseAbstract;
