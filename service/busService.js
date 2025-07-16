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
} = require("../model");

const { Op, where } = require("sequelize");

exports.getBusResponse = async (bus) => {
  const busResponse = await Bus.findOne({
    where: { id: bus.id },
    include: [
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user" }],
      },
      {
        model: Assistant,
        as: "assistant",
        include: [{ model: User, as: "user" }],
      },
      {
        model: Route,
        as: "route",
      },
      {
        model: Camera,
        as: "tbl_camera",
      },
    ],
  });
  console.log("Bus Response:", busResponse.camera);
  return {
    id: busResponse.id,
    licensePlate: busResponse.license_plate,
    name: busResponse.name,
    driverId: busResponse.driver == null ? null : busResponse.driver.id,
    driverName:
      busResponse.driver == null ? null : busResponse.driver.user.name,
    driverPhone:
      busResponse.driver == null ? null : busResponse.driver.user.phone,
    assistantId:
      busResponse.assistant == null ? null : busResponse.assistant.id,
    assistantName:
      busResponse.assistant == null ? null : busResponse.assistant.user.name,
    assistantPhone:
      busResponse.assistant == null ? null : busResponse.assistant.user.phone,
    amountOfStudents:
      busResponse.amount_of_student == null
        ? null
        : busResponse.amount_of_student,
    routeId: busResponse.route == null ? null : busResponse.route.id,
    routeCode: busResponse.route == null ? null : busResponse.route.code,
    espId: busResponse.esp_id == null ? null : busResponse.esp_id,
    cameraFacesluice:
      busResponse.tbl_camera == null ? null : busResponse.tbl_camera.facesluice,
    busStatus: busResponse.status == null ? null : busResponse.status,
  };
};
