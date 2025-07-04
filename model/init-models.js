var DataTypes = require("sequelize").DataTypes;
var _tbl_assistant = require("./tbl_assistant");
var _tbl_attendance = require("./tbl_attendance");
var _tbl_bus = require("./tbl_bus");
var _tbl_bus_schedule = require("./tbl_bus_schedule");
var _tbl_camera = require("./tbl_camera");
var _tbl_camera_request = require("./tbl_camera_request");
var _tbl_camera_request_detail = require("./tbl_camera_request_detail");
var _tbl_checkpoint = require("./tbl_checkpoint");
var _tbl_driver = require("./tbl_driver");
var _tbl_event = require("./tbl_event");
var _tbl_grade = require("./tbl_grade");
var _tbl_otp_token = require("./tbl_otp_token");
var _tbl_parent = require("./tbl_parent");
var _tbl_password_reset_session = require("./tbl_password_reset_session");
var _tbl_permission = require("./tbl_permission");
var _tbl_request = require("./tbl_request");
var _tbl_request_type = require("./tbl_request_type");
var _tbl_role = require("./tbl_role");
var _tbl_role_has_permission = require("./tbl_role_has_permission");
var _tbl_route = require("./tbl_route");
var _tbl_student = require("./tbl_student");
var _tbl_student_has_grade = require("./tbl_student_has_grade");
var _tbl_teacher = require("./tbl_teacher");
var _tbl_teacher_has_grade = require("./tbl_teacher_has_grade");
var _tbl_token = require("./tbl_token");
var _tbl_user = require("./tbl_user");
var _tbl_user_has_role = require("./tbl_user_has_role");

function initModels(sequelize) {
  var tbl_assistant = _tbl_assistant(sequelize, DataTypes);
  var tbl_attendance = _tbl_attendance(sequelize, DataTypes);
  var tbl_bus = _tbl_bus(sequelize, DataTypes);
  var tbl_bus_schedule = _tbl_bus_schedule(sequelize, DataTypes);
  var tbl_camera = _tbl_camera(sequelize, DataTypes);
  var tbl_camera_request = _tbl_camera_request(sequelize, DataTypes);
  var tbl_camera_request_detail = _tbl_camera_request_detail(
    sequelize,
    DataTypes
  );
  var tbl_checkpoint = _tbl_checkpoint(sequelize, DataTypes);
  var tbl_driver = _tbl_driver(sequelize, DataTypes);
  var tbl_event = _tbl_event(sequelize, DataTypes);
  var tbl_grade = _tbl_grade(sequelize, DataTypes);
  var tbl_otp_token = _tbl_otp_token(sequelize, DataTypes);
  var tbl_parent = _tbl_parent(sequelize, DataTypes);
  var tbl_password_reset_session = _tbl_password_reset_session(
    sequelize,
    DataTypes
  );
  var tbl_permission = _tbl_permission(sequelize, DataTypes);
  var tbl_request = _tbl_request(sequelize, DataTypes);
  var tbl_request_type = _tbl_request_type(sequelize, DataTypes);
  var tbl_role = _tbl_role(sequelize, DataTypes);
  var tbl_role_has_permission = _tbl_role_has_permission(sequelize, DataTypes);
  var tbl_route = _tbl_route(sequelize, DataTypes);
  var tbl_student = _tbl_student(sequelize, DataTypes);
  var tbl_student_has_grade = _tbl_student_has_grade(sequelize, DataTypes);
  var tbl_teacher = _tbl_teacher(sequelize, DataTypes);
  var tbl_teacher_has_grade = _tbl_teacher_has_grade(sequelize, DataTypes);
  var tbl_token = _tbl_token(sequelize, DataTypes);
  var tbl_user = _tbl_user(sequelize, DataTypes);
  var tbl_user_has_role = _tbl_user_has_role(sequelize, DataTypes);

  tbl_camera_request.belongsToMany(tbl_student, {
    as: "student_id_tbl_students",
    through: tbl_camera_request_detail,
    foreignKey: "camera_request_id",
    otherKey: "student_id",
  });
  tbl_student.belongsToMany(tbl_camera_request, {
    as: "camera_request_id_tbl_camera_requests",
    through: tbl_camera_request_detail,
    foreignKey: "student_id",
    otherKey: "camera_request_id",
  });
  tbl_bus.belongsTo(tbl_assistant, {
    as: "assistant",
    foreignKey: "assistant_id",
  });
  tbl_assistant.hasMany(tbl_bus, {
    as: "tbl_buses",
    foreignKey: "assistant_id",
  });
  tbl_bus_schedule.belongsTo(tbl_assistant, {
    as: "assistant",
    foreignKey: "assistant_id",
  });
  tbl_assistant.hasMany(tbl_bus_schedule, {
    as: "tbl_bus_schedules",
    foreignKey: "assistant_id",
  });
  tbl_attendance.belongsTo(tbl_bus, { as: "bus", foreignKey: "bus_id" });
  tbl_bus.hasMany(tbl_attendance, {
    as: "tbl_attendances",
    foreignKey: "bus_id",
  });
  tbl_bus_schedule.belongsTo(tbl_bus, { as: "bus", foreignKey: "bus_id" });
  tbl_bus.hasMany(tbl_bus_schedule, {
    as: "tbl_bus_schedules",
    foreignKey: "bus_id",
  });
  tbl_camera.belongsTo(tbl_bus, { as: "bus", foreignKey: "bus_id" });
  tbl_bus.hasOne(tbl_camera, { as: "tbl_camera", foreignKey: "bus_id" });
  tbl_student.belongsTo(tbl_bus, { as: "bus", foreignKey: "bus_id" });
  tbl_bus.hasMany(tbl_student, { as: "tbl_students", foreignKey: "bus_id" });
  tbl_camera_request.belongsTo(tbl_camera, {
    as: "camera",
    foreignKey: "camera_id",
  });
  tbl_camera.hasMany(tbl_camera_request, {
    as: "tbl_camera_requests",
    foreignKey: "camera_id",
  });
  tbl_camera_request_detail.belongsTo(tbl_camera_request, {
    as: "camera_request",
    foreignKey: "camera_request_id",
  });
  tbl_camera_request.hasMany(tbl_camera_request_detail, {
    as: "tbl_camera_request_details",
    foreignKey: "camera_request_id",
  });
  tbl_attendance.belongsTo(tbl_checkpoint, {
    as: "checkpoint",
    foreignKey: "checkpoint_id",
  });
  tbl_checkpoint.hasMany(tbl_attendance, {
    as: "tbl_attendances",
    foreignKey: "checkpoint_id",
  });
  tbl_request.belongsTo(tbl_checkpoint, {
    as: "checkpoint",
    foreignKey: "checkpoint_id",
  });
  tbl_checkpoint.hasMany(tbl_request, {
    as: "tbl_requests",
    foreignKey: "checkpoint_id",
  });
  tbl_student.belongsTo(tbl_checkpoint, {
    as: "checkpoint",
    foreignKey: "checkpoint_id",
  });
  tbl_checkpoint.hasMany(tbl_student, {
    as: "tbl_students",
    foreignKey: "checkpoint_id",
  });
  tbl_bus.belongsTo(tbl_driver, { as: "driver", foreignKey: "driver_id" });
  tbl_driver.hasMany(tbl_bus, { as: "tbl_buses", foreignKey: "driver_id" });
  tbl_bus_schedule.belongsTo(tbl_driver, {
    as: "driver",
    foreignKey: "driver_id",
  });
  tbl_driver.hasMany(tbl_bus_schedule, {
    as: "tbl_bus_schedules",
    foreignKey: "driver_id",
  });
  tbl_student_has_grade.belongsTo(tbl_grade, {
    as: "grade",
    foreignKey: "grade_id",
  });
  tbl_grade.hasMany(tbl_student_has_grade, {
    as: "tbl_student_has_grades",
    foreignKey: "grade_id",
  });
  tbl_teacher_has_grade.belongsTo(tbl_grade, {
    as: "grade",
    foreignKey: "grade_id",
  });
  tbl_grade.hasMany(tbl_teacher_has_grade, {
    as: "tbl_teacher_has_grades",
    foreignKey: "grade_id",
  });
  tbl_student.belongsTo(tbl_parent, { as: "parent", foreignKey: "parent_id" });
  tbl_parent.hasMany(tbl_student, {
    as: "tbl_students",
    foreignKey: "parent_id",
  });
  tbl_role_has_permission.belongsTo(tbl_permission, {
    as: "permission",
    foreignKey: "permission_id",
  });
  tbl_permission.hasMany(tbl_role_has_permission, {
    as: "tbl_role_has_permissions",
    foreignKey: "permission_id",
  });
  tbl_request.belongsTo(tbl_request_type, {
    as: "request_type",
    foreignKey: "request_type_id",
  });
  tbl_request_type.hasMany(tbl_request, {
    as: "tbl_requests",
    foreignKey: "request_type_id",
  });
  tbl_role_has_permission.belongsTo(tbl_role, {
    as: "role",
    foreignKey: "role_id",
  });
  tbl_role.hasMany(tbl_role_has_permission, {
    as: "tbl_role_has_permissions",
    foreignKey: "role_id",
  });
  tbl_user_has_role.belongsTo(tbl_role, { as: "role", foreignKey: "role_id" });
  tbl_role.hasMany(tbl_user_has_role, {
    as: "tbl_user_has_roles",
    foreignKey: "role_id",
  });
  tbl_bus.belongsTo(tbl_route, { as: "route", foreignKey: "route_id" });
  tbl_route.hasMany(tbl_bus, { as: "tbl_buses", foreignKey: "route_id" });
  tbl_bus_schedule.belongsTo(tbl_route, {
    as: "route",
    foreignKey: "route_id",
  });
  tbl_route.hasMany(tbl_bus_schedule, {
    as: "tbl_bus_schedules",
    foreignKey: "route_id",
  });
  tbl_checkpoint.belongsTo(tbl_route, { as: "route", foreignKey: "route_id" });
  tbl_route.hasMany(tbl_checkpoint, {
    as: "tbl_checkpoints",
    foreignKey: "route_id",
  });
  tbl_attendance.belongsTo(tbl_student, {
    as: "student",
    foreignKey: "student_id",
  });
  tbl_student.hasMany(tbl_attendance, {
    as: "tbl_attendances",
    foreignKey: "student_id",
  });
  tbl_camera_request_detail.belongsTo(tbl_student, {
    as: "student",
    foreignKey: "student_id",
  });
  tbl_student.hasMany(tbl_camera_request_detail, {
    as: "tbl_camera_request_details",
    foreignKey: "student_id",
  });
  tbl_request.belongsTo(tbl_student, {
    as: "student",
    foreignKey: "student_id",
  });
  tbl_student.hasMany(tbl_request, {
    as: "tbl_requests",
    foreignKey: "student_id",
  });
  tbl_student_has_grade.belongsTo(tbl_student, {
    as: "student",
    foreignKey: "student_id",
  });
  tbl_student.hasMany(tbl_student_has_grade, {
    as: "tbl_student_has_grades",
    foreignKey: "student_id",
  });
  tbl_attendance.belongsTo(tbl_teacher, {
    as: "teacher",
    foreignKey: "teacher_id",
  });
  tbl_teacher.hasMany(tbl_attendance, {
    as: "tbl_attendances",
    foreignKey: "teacher_id",
  });
  tbl_grade.belongsTo(tbl_teacher, { as: "teacher", foreignKey: "teacher_id" });
  tbl_teacher.hasOne(tbl_grade, { as: "tbl_grade", foreignKey: "teacher_id" });
  tbl_teacher_has_grade.belongsTo(tbl_teacher, {
    as: "teacher",
    foreignKey: "teacher_id",
  });
  tbl_teacher.hasMany(tbl_teacher_has_grade, {
    as: "tbl_teacher_has_grades",
    foreignKey: "teacher_id",
  });
  tbl_assistant.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasOne(tbl_assistant, {
    as: "tbl_assistant",
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  tbl_driver.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasOne(tbl_driver, {
    as: "tbl_driver",
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  tbl_parent.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasOne(tbl_parent, {
    as: "tbl_parent",
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  tbl_request.belongsTo(tbl_user, {
    as: "approved_by_tbl_user",
    foreignKey: "approved_by",
  });
  tbl_user.hasMany(tbl_request, {
    as: "tbl_requests",
    foreignKey: "approved_by",
  });
  tbl_request.belongsTo(tbl_user, {
    as: "send_by_tbl_user",
    foreignKey: "send_by",
  });
  tbl_user.hasMany(tbl_request, {
    as: "send_by_tbl_requests",
    foreignKey: "send_by",
  });
  tbl_teacher.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasOne(tbl_teacher, {
    as: "tbl_teacher",
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  tbl_token.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasMany(tbl_token, { as: "tbl_tokens", foreignKey: "user_id" });
  tbl_user_has_role.belongsTo(tbl_user, { as: "user", foreignKey: "user_id" });
  tbl_user.hasMany(tbl_user_has_role, {
    as: "tbl_user_has_roles",
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });

  return {
    tbl_assistant,
    tbl_attendance,
    tbl_bus,
    tbl_bus_schedule,
    tbl_camera,
    tbl_camera_request,
    tbl_camera_request_detail,
    tbl_checkpoint,
    tbl_driver,
    tbl_event,
    tbl_grade,
    tbl_otp_token,
    tbl_parent,
    tbl_password_reset_session,
    tbl_permission,
    tbl_request,
    tbl_request_type,
    tbl_role,
    tbl_role_has_permission,
    tbl_route,
    tbl_student,
    tbl_student_has_grade,
    tbl_teacher,
    tbl_teacher_has_grade,
    tbl_token,
    tbl_user,
    tbl_user_has_role,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
