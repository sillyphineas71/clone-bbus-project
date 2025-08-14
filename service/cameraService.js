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
const DateTimeUtils = require("../util/dateTimeUtils");
exports.createOrUpdateCamera = async (camera) => {
  const cameraExist = await Camera.findOne({
    where: {
      facesluice: camera.facesluice,
    },
  });
  if (cameraExist) {
    //update
    await camera.save();
  } else {
    //create
    await Camera.create({
      time_basic: camera.time_basic,
      time_heartbeat: camera.time_heartbeat,
      bus_id: camera.bus_id,
      facesluice: camera.facesluice,
    });
  }
};

exports.handleBasicMessage = async (message) => {
  const camera = Camera.findOne(message.info.facesluiceId);
  if (!camera) {
    camera = new Camera({
      facesluice: message.info.facesluiceId,
    });
  }
  camera.time_basic = DateTimeUtils.convertToLocalDateTime(message.info.time);
  this.createOrUpdateCamera(camera);
};

exports.handleHeartbeatMessage = async (message) => {
  const camera = await Camera.findOne({
    where: {
      facesluice: message.info.facesluiceId,
    },
  });
  if (!camera) {
    camera = new Camera({
      facesluice: message.info.facesluiceId,
    });
  }
  camera.time_heartbeat = DateTimeUtils.convertToLocalDateTime(
    message.info.time
  );
  await camera.save();
};
