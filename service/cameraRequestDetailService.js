const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
  tbl_driver: Driver,
  tbl_parent: Parent,
  tbl_teacher: Teacher,
  tbl_assistant: Assistant,
  tbl_student: Student,
  tbl_bus: Bus,
  tbl_checkpoint: CheckPoint,
  tbl_route: Route,
  tbl_camera: Camera,
  tbl_attendance: Attendence,
  tbl_camera_request: CameraRequest,
  tbl_camera_request_detail: CameraRequestDetail,
} = require("../model");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { Op, where } = require("sequelize");

exports.saveAll = async (cameraRequestDetails) => {
  if (
    !Array.isArray(cameraRequestDetails) ||
    cameraRequestDetails.length === 0
  ) {
    throw new Error("cameraRequestDetails must be a non-empty array");
  }
  console.log("HAHAHAH", cameraRequestDetails);
  const validDetails = cameraRequestDetails.filter((detail) => {
    return (
      detail.camera_request_id && isUuid(detail.camera_request_id)
      //detail.student_id &&
      //isUuid(detail.student_id)
    );
  });
  console.log("VALID CAMERA", validDetails);
  if (validDetails.length === 0) {
    throw new Error("No valid camera request details provided");
  }

  return await CameraRequestDetail.bulkCreate(validDetails, {
    returning: true,
  });
};

exports.save = async (cameraRequestDetail) => {
  if (
    !cameraRequestDetail.camera_request_id ||
    !isUuid(cameraRequestDetail.camera_request_id) ||
    !cameraRequestDetail.camera_id ||
    !isUuid(cameraRequestDetail.camera_id) ||
    !cameraRequestDetail.status ||
    typeof cameraRequestDetail.status !== "string"
  ) {
    throw new Error("Invalid camera request detail");
  }

  return await CameraRequestDetail.create(cameraRequestDetail);
};
