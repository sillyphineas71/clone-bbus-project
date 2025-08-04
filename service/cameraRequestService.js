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
  tbl_camera_request_detail: CamreraRequestDetail,
} = require("../model");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { Op, where } = require("sequelize");
const {
  cameraRequestResponse,
  CameraRequestResponse,
} = require("../model/dto/response/camerarequest/CameraRequestResponse");
const CameraRequestPageResponse = require("../model/dto/response/camerarequest/CameraRequestPageResponse");
exports.findAll = async (keyword, sort, page, size) => {
  let order = [["id", "ASC"]];
  if (sort) {
    const [column, direction] = sort.split(":");
    order = [
      [
        column,
        direction && direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
      ],
    ];
  }
  // Tim tu khoa neu co
  let cameraWhere = {};
  let cameraRequestWhere = {};
  if (keyword) {
    const searchQuery = `%${keyword.toLowerCase()}%`;
    cameraRequestWhere = {
      status: { [Op.iLike]: searchQuery },
    };

    cameraWhere = {
      facesluice: { [Op.iLike]: searchQuery },
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalCameraRequest, rows: cameraRequests } =
    await CameraRequest.findAndCountAll({
      where: cameraRequestWhere,
      include: [
        {
          model: Camera,
          as: "camera",
          where: cameraWhere,
        },
      ],
      order,
      offset,
      limit: pageSize,
    });
  const result = await this.getCameraRequestPageResponse(
    page,
    size,
    totalCameraRequest,
    cameraRequests
  );
  return {
    status: 200,
    message: "checkpoint list",
    data: result,
  };
};

exports.getCameraRequestPageResponse = async (
  page,
  size,
  totalEntity,
  entities
) => {
  const cameraRequestResponses = entities.map(async (entity) => {
    const getCameraRequestDetails = await CamreraRequestDetail.findAll({
      where: { camera_request_id: entity.id },
    });
    const cameraRequestDetails = [];
    for (const detail of getCameraRequestDetails) {
      const response = new CameraRequestResponse(detail);
      cameraRequestDetails.push(response);
    }
    return {
      cameraRequestId: entity.id,
      requestType: entity.request_type,
      status: entity.status,
      requests: cameraRequestDetails,
    };
  });
  return new CameraRequestPageResponse(
    page,
    size,
    Math.ceil(totalEntity / size),
    totalEntity,
    cameraRequestResponses
  );
};

exports.findById = async (id) => {
  const cameraRequest = await CameraRequest.findByPk(id);
  if (!cameraRequest) {
    return {
      status: 404,
      message: "Camera request not found",
    };
  }
  return {
    status: 200,
    message: "Camera request detail",
    data: cameraRequest,
  };
};

exports.save = async (cameraRData) => {
  const cameraRequest = await CameraRequest.create({
    id: uuidv4(),
  });

  return {
    status: 201,
    message: "Camera request created successfully",
    data: cameraRequest,
  };
};
