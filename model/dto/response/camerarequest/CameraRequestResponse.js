class CameraRequestResponse {
  constructor(cameraRequestId, requestType, createdAt, status, requests) {
    this.cameraRequestId = cameraRequestId;
    this.requestType = requestType;
    this.createdAt = createdAt;
    this.status = status;
    this.requests = requests.map((detail) => new CameraRequestDetail(detail));
  }
}

class CameraRequestDetail {
  constructor(detailEntity) {
    this.studentId = detailEntity.id.student.id;
    this.name = detailEntity.name;
    this.rollNumber = detailEntity.rollNumber;
    this.personType = detailEntity.personType === 0 ? "ACTIVE" : "INACTIVE";
    this.avatar = detailEntity.avatar;
    this.errCode = this.getErrCode(detailEntity.errCode);
  }

  getErrCode(errCode) {
    switch (errCode) {
      case 0:
        return "Thêm ảnh thành công";
      case 1:
        return "Camera khả dụng";
      case 461:
        return "Đã tồn tại";
      case 466:
        return "URL ảnh không hợp lệ";
      case 467:
        return "Size ảnh quá lớn";
      case 468:
        return "Không thể lấy mặt người từ ảnh";
      case 469:
        return "Không thể lưu ảnh vào camera";
      default:
        return "Không biết";
    }
  }
}

module.exports = {
  CameraRequestResponse,
  CameraRequestDetail,
};
