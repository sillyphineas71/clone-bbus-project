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
  tbl_request_type: RequestType,
} = require("../model");
const { v4: uuidv4 } = require("uuid");
const { Op, where } = require("sequelize");
const RequestTypeResponse = require("../model/dto/response/requestType/RequestTypeResponse");
const RequestTypePageResponse = require("../model/dto/response/requestType/RequestTypePageResponse");

exports.getRequestTypeResponse = async (requestType) => {
  const RequestTypeResponse = await RequestType.findByPk(requestType.id);
  return {
    id: RequestTypeResponse.id,
    requestTypeName: RequestTypeResponse.request_type_name,
  };
};
exports.getRequestTypePageResponse = async (
  page,
  size,
  totalEntity,
  requestTypeEntities
) => {
  const requestTypeResponse = [];
  for (const reqType of requestTypeEntities) {
    const response = await this.getRequestTypeResponse(reqType);
    requestTypeResponse.push(response);
  }

  return new RequestTypePageResponse(
    page,
    size,
    Math.ceil(totalEntity / size),
    totalEntity,
    requestTypeResponse
  );
};

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
  let whereClause = {};
  if (keyword) {
    const searchQuery = `%${keyword.toLowerCase()}%`;
    whereClause = {
      [Op.or]: [{ request_type_name: { [Op.iLike]: searchQuery } }],
    };
  }
  // Phan trang
  const currentPage = page && page > 0 ? parseInt(page) : 1;
  const pageSize = size && size > 0 ? parseInt(size) : 10;
  const offset = (currentPage - 1) * pageSize;

  //Query
  const { count: totalRequestType, rows: requestTypes } =
    await RequestType.findAndCountAll({
      where: whereClause,
      order,
      offset,
      limit: pageSize,
    });
  const result = await this.getRequestTypePageResponse(
    page,
    size,
    totalRequestType,
    requestTypes
  );
  return {
    status: 200,
    message: "requestType list",
    data: result,
  };
};

exports.findById = async (requestTypeId) => {
  const reqType = await RequestType.findOne({ where: { id: requestTypeId } });
  const result = new RequestTypeResponse(reqType.id, reqType.request_type_name);
  return {
    status: 200,
    message: "requestType detail",
    data: result,
  };
};
