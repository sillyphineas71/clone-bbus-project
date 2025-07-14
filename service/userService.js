// services/userService.js

const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
  tbl_driver: Driver,
  tbl_parent: Parent,
  tbl_teacher: Teacher,
  tbl_assistant: Assistant,
} = require("../model");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const s3Service = require("./s3Service");
const createError = require("http-errors");

exports.createUser = async (userData, file) => {
  const { email, phone, name, gender, dob, address, role } = userData;
  const avatar = file ? file.originalname : null;
  const rawPassword = crypto.randomBytes(6).toString("base64");
  const hashPassword = await bcrypt.hash(rawPassword, 12);

  // Tạo user
  const user = await User.create({
    id: uuidv4(),
    name,
    gender,
    dob,
    email,
    phone,
    address,
    username: rawPassword,
    password: hashPassword,
    avatar,
    type: "USER",
    status: "ACTIVE",
  });

  // Gán role
  const roleUser = await Role.findOne({ where: { name: role } });
  await UserHasRole.create({
    id: uuidv4(),
    role_id: roleUser.id,
    user_id: user.id,
  });

  // Tạo entity phụ
  if (role === "PARENT") await Parent.create({ id: uuidv4(), userId: user.id });
  if (role === "DRIVER") await Driver.create({ id: uuidv4(), userId: user.id });
  if (role === "ASSISTANT")
    await Assistant.create({ id: uuidv4(), userId: user.id });
  if (role === "TEACHER")
    await Teacher.create({ id: uuidv4(), userId: user.id });

  return user;
};

module.exports.uploadAvatar = function (avatars) {
  const prefix = `admins/`;
  const uploads = avatars.map((file) =>
    s3Service.uploadFile(
      prefix + file.originalname,
      file.buffer,
      file.size,
      file.mimetype
    )
  );
  return Promise.all(uploads);
};

exports.updateAvatarUserLoggedIn = (userId, file) => {
  let s3Key;
  return UserHasRole.findOne({ where: { user_id: userId } })
    .then((userHasRole) => {
      if (!userHasRole) {
        throw createError(404, "User not found");
      }
      return Role.findByPk(userHasRole.role_id);
    })
    .catch((err) => {
      console.error(err);
    })
    .then((role) => {
      if (!role) {
        throw createError(404, "Role not found");
      }
      s3Key = `${role.name.toLowerCase()}s/${file.originalname}`;
      return s3Service.uploadFile(s3Key, file.buffer, file.size, file.mimetype);
    })
    .then(() => {
      return User.findByPk(userId).then((user) => {
        if (!user) {
          throw createError(404, "User not found");
        }
        user.avatar = file.originalname;
        return user.save();
      });
    })
    .then(() => {
      return s3Service.getPresignedUrl(s3Key);
    });
};
