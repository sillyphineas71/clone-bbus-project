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

exports.getUserList = async (query) => {
  const { keyword, roleName, sort, page = 0, size = 100000 } = query;
  const where = {};
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${keyword}%` } },
      { username: { [Op.iLike]: `%${keyword}%` } },
      { email: { [Op.iLike]: `%${keyword}%` } },
    ];
  }
  const include = [];
  if (roleName) {
    include.push({
      model: Role,
      as: "roles",
      where: { name: roleName },
      through: { attributes: [] },
    });
  }
  const order = [];
  if (sort) {
    const [field, dir] = sort.split(",");
    order.push([field, (dir || "").toUpperCase() === "DESC" ? "DESC" : "ASC"]);
  }
  const result = await User.findAndCountAll({
    where,
    include,
    order,
    distinct: true,
    limit: parseInt(size, 10),
    offset: page * size,
  });
  const totalElements = result.count;
  const totalPages = Math.ceil(totalElements / size);
  return {
    pageNumber: parseInt(page, 10),
    pageSize: parseInt(size, 10),
    totalPages,
    totalElements,
    users: result.rows,
  };
};

exports.getUserById = async (userId) => {
  const records = await UserHasRole.findAll({
    where: { user_id: userId },
    include: [
      { model: Role, as: "role", attributes: ["name"] },
      { model: User, as: "user" },
    ],
  });
  if (!records.length) return { status: 404, message: "User not found" };
  const isAdmin = records.some(
    ({ role }) => role && (role.name === "ADMIN" || role.name === "SYSADMIN")
  );
  if (!isAdmin)
    return {
      status: 403,
      message: "You are not allowed to access this resource",
    };
  return { status: 200, user: records[0].user };
};

exports.importUsers = async (file, roleName, body) => {
  // Kiểm tra role
  const roleUser = await Role.findOne({ where: { name: roleName } });
  if (!file || !roleName) {
    return { status: 400, message: "File và roleName là bắt buộc" };
  }
  if (!roleUser) {
    return { status: 400, message: "Role không tồn tại" };
  }
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const usersData = xlsx.utils.sheet_to_json(sheet);
  const createUser = [];
  const details = {};
  for (let i = 0; i < usersData.length; i++) {
    const row = usersData[i];
    const lineNumber = i + 2;
    let errorMsg = "";
    const { email, phone } = row;
    if (await User.findOne({ where: { email } }))
      errorMsg += "Email đã tồn tại. ";
    if (await User.findOne({ where: { phone } }))
      errorMsg += "Số điện thoại đã tồn tại. ";
    if (errorMsg) {
      details[lineNumber] = `Lỗi dòng ${lineNumber}: ${errorMsg.trim()}`;
      continue;
    }
    try {
      const user = await exports.createUser(
        { ...body, ...row, role: roleName },
        null
      );
      createUser.push({
        user,
        rolename: roleName,
        accountNonExpired: true,
        credentialsNonExpired: true,
        accountNonLocked: true,
      });
    } catch (errRow) {
      details[lineNumber] = `Lỗi dòng ${lineNumber}: ${errRow.message}`;
    }
  }
  fs.unlinkSync(file.path);
  if (Object.keys(details).length > 0) {
    return {
      status: 409,
      message: "Import thất bại với nhiều lỗi trong file",
      details,
    };
  }
  return {
    status: 202,
    message: "Import users completed",
    created: createUser,
  };
};

exports.updateUser = async (body) => {
  const { id, username, name, gender, dob, email, phone, address, status } =
    body;
  if (!id) return { status: 400, message: "UserId is required" };
  const existUser = await User.findByPk(id);
  if (!existUser) return { status: 400, message: "User does not exist" };
  if (email) {
    const existEmail = await User.findAll({
      where: { email, id: { [Op.ne]: id } },
    });
    if (existEmail.length > 0)
      return { status: 400, message: `Email ${email} is existing` };
  }
  if (phone) {
    const existPhone = await User.findAll({
      where: { phone, id: { [Op.ne]: id } },
    });
    if (existPhone.length > 0)
      return { status: 400, message: `Phone ${phone} is existing` };
  }
  const updateUser = {};
  if (username != undefined) updateUser.username = username;
  if (name != undefined) updateUser.name = name;
  if (gender != undefined) updateUser.gender = gender;
  if (dob != undefined) updateUser.dob = dob;
  if (address != undefined) updateUser.address = address;
  if (status != undefined) updateUser.status = status;
  await User.update(updateUser, { where: { id } });
  return { status: 202, message: "user updated successfully" };
};

exports.changePassword = async (body) => {
  const { id, currentPassword, password, confirmPassword } = body;
  if (!id || !currentPassword || !password || !confirmPassword) {
    return { status: 400, message: "Missing information to change password" };
  }
  const existUser = await User.findByPk(id);
  if (!existUser) return { status: 400, message: "User does not exist" };
  const isMatch = await bcrypt.compare(currentPassword, existUser.password);
  if (!isMatch)
    return { status: 400, message: "Current password is incorrect" };
  if (password !== confirmPassword) {
    return {
      status: 400,
      message: "New password and confirm password are not the same",
    };
  }
  const hashPassword = await bcrypt.hash(password, 12);
  await User.update(
    { password: hashPassword, username: password },
    { where: { id } }
  );
  return { status: 202, message: "user change password successfully" };
};

exports.changeStatus = async (body) => {
  const { id, status } = body;
  if (!id || !status)
    return { status: 400, message: "Missing id or status information" };
  const user = await User.findByPk(id);
  if (!user) return { status: 404, message: "User does not exist" };
  await User.update({ status }, { where: { id } });
  return { status: 202, message: "user change status successfully" };
};

exports.deleteUser = async (userId) => {
  const existUser = await User.findOne({ where: { id: userId } });
  if (!existUser) return { status: 400, message: "User does not exist" };
  const userRole = await UserHasRole.findOne({ where: { user_id: userId } });
  if (!userRole) return { status: 400, message: "User role not found" };
  const role = await Role.findOne({ where: { id: userRole.role_id } });
  if (!role) return { status: 400, message: "Role not found" };
  if (role.name === "PARENT")
    await Parent.destroy({ where: { user_id: userId } });
  if (role.name === "DRIVER")
    await Driver.destroy({ where: { user_id: userId } });
  if (role.name === "ASSISTANT")
    await Assistant.destroy({ where: { user_id: userId } });
  if (role.name === "TEACHER")
    await Teacher.destroy({ where: { user_id: userId } });
  await UserHasRole.destroy({ where: { user_id: userId } });
  const userDelete = await User.destroy({ where: { id: userId } });
  if (userDelete > 0) {
    return { status: 202, message: "User deleted successfully" };
  } else {
    return { status: 400, message: "User not found or already deleted" };
  }
};

exports.getEntityByUserId = async (userId) => {
  const existUser = await User.findOne({ where: { id: userId } });
  if (!existUser) return { status: 400, message: "User does not exist" };
  const userRole = await UserHasRole.findOne({ where: { user_id: userId } });
  if (!userRole) return { status: 400, message: "User role not found" };
  const role = await Role.findOne({ where: { id: userRole.role_id } });
  if (!role) return { status: 400, message: "Role not found" };
  let entity = null;
  if (role.name === "PARENT")
    entity = await Parent.findOne({ where: { user_id: userId } });
  else if (role.name === "DRIVER")
    entity = await Driver.findOne({ where: { user_id: userId } });
  else if (role.name === "ASSISTANT")
    entity = await Assistant.findOne({ where: { user_id: userId } });
  else if (role.name === "TEACHER")
    entity = await Teacher.findOne({ where: { user_id: userId } });
  else entity = null;
  if (!entity) return { status: 404, message: "Entity not found" };
  return {
    status: 200,
    data: {
      id: entity.id,
      createdAt: entity.createdAt,
      updateAt: entity.updateAt,
      user: {
        existUser,
        roleName: role.name,
        accountNonExpired: true,
        credentialsNonExpired: true,
        accountNonLocked: true,
      },
    },
  };
};
exports.getRoleByUserId = async (userId) => {
  const existUser = await User.findOne({ where: { id: userId } });
  if (!existUser) return { status: 400, message: "User does not exist" };
  const userRole = await UserHasRole.findOne({ where: { user_id: userId } });
  if (!userRole) return { status: 400, message: "User role not found" };
  const role = await Role.findOne({ where: { id: userRole.role_id } });
  if (!role) return { status: 400, message: "Role not found" };
  return {
    status: 200,
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
    },
  };
};
