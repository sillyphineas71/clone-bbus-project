const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
} = require("../model");
const {
  tbl_driver: Driver,
  tbl_parent: Parent,
  tbl_teacher: Teacher,
  tbl_assistant: Assistant,
} = require("../model");
const { Op, where } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const xlsx = require("xlsx");
const fs = require("fs");
const userService = require("../service/userService");
const { uploadAvatar } = require("../service/userService");

exports.getUserList = (req, res, next) => {
  const { keyword, roleName, sort, page = 0, size = 100000 } = req.query;

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

  User.findAndCountAll({
    where,
    include,
    order,
    distinct: true,
    limit: parseInt(size, 10),
    offset: page * size,
  })
    .then((result) => {
      const totalElements = result.count;
      const totalPages = Math.ceil(totalElements / size);

      res.status(200).json({
        status: 200,
        message: "user list",
        data: {
          pageNumber: parseInt(page, 10),
          pageSize: parseInt(size, 10),
          totalPages: totalPages,
          totalElements: totalElements,
          users: result.rows,
        },
      });
    })
    .catch((err) => {
      console.error("SequelizeError.message:", err.message);
      if (err.parent) {
        console.error("SequelizeError.parent:", err.parent);
      }
      next(err);
    });
};

exports.getUserById = (req, res, next) => {
  const userId = req.params.userId;
  console.log("getUserById userId:", userId);
  UserHasRole.findAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["name"],
      },
      {
        model: User,
        as: "user",
      },
    ],
  })
    .then((records) => {
      if (!records.length) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
      const isAdmin = records.some(
        ({ role }) =>
          role && (role.name === "ADMIN" || role.name === "SYSADMIN")
      );
      if (!isAdmin) {
        return res.status(403).json({
          status: 403,
          message: "You are not allowed to access this resource",
        });
      }
      return records[0].user;
    })
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }

      res.status(200).json({
        status: 200,
        message: "get user detail",
        data: user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//POST --- CREATE USER
exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.file);
    return res.status(201).json({
      status: 201,
      message: "user created successfully",
      data: user.id,
    });
  } catch (err) {
    console.error("Create User Error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

exports.importUsers = async (req, res, next) => {
  try {
    const file = req.file;
    const roleName = req.body.roleName;

    if (!file || !roleName) {
      return res.status(400).json({ message: "File và roleName là bắt buộc" });
    }

    // Kiểm tra role
    const roleUser = await Role.findOne({ where: { name: roleName } });
    if (!roleUser) {
      return res.status(400).json({ message: "Role không tồn tại" });
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const usersData = xlsx.utils.sheet_to_json(sheet);

    const createUser = [];
    const details = {}; // object lưu lỗi theo dòng

    for (let i = 0; i < usersData.length; i++) {
      const row = usersData[i];
      const lineNumber = i + 2; // Nếu dòng 1 là header, dòng 2 là data đầu tiên

      let errorMsg = "";

      const { email, phone, name, gender, dob, address } = row;

      if (await User.findOne({ where: { email } })) {
        errorMsg += "Email đã tồn tại. ";
      }
      if (await User.findOne({ where: { phone } })) {
        errorMsg += "Số điện thoại đã tồn tại. ";
      }
      // Có thể bổ sung các kiểm tra khác ở đây (ví dụ: validate định dạng...)

      if (errorMsg) {
        details[lineNumber] = `Lỗi dòng ${lineNumber}: ${errorMsg.trim()}`;
        continue;
      }

      try {
        const rawPassword = crypto.randomBytes(6).toString("base64");
        const hashPassword = await bcrypt.hash(rawPassword, 12);

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
          type: "USER",
          status: "ACTIVE",
        });

        await UserHasRole.create({
          id: uuidv4(),
          role_id: roleUser.id,
          user_id: user.id,
        });

        // Tạo entity phụ
        if (roleName === "PARENT")
          await Parent.create({ id: uuidv4(), user_id: user.id });
        if (roleName === "DRIVER")
          await Driver.create({ id: uuidv4(), user_id: user.id });
        if (roleName === "ASSISTANT")
          await Assistant.create({ id: uuidv4(), user_id: user.id });
        if (roleName === "TEACHER")
          await Teacher.create({ id: uuidv4(), user_id: user.id });

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
    // Xóa file sau khi xử lý
    fs.unlinkSync(file.path);

    if (Object.keys(details).length > 0) {
      return res.status(409).json({
        status: 409,
        message: "Import thất bại với nhiều lỗi trong file",
        details,
      });
    }

    return res.status(201).json({
      status: 201,
      message: "Import users completed",
      created: createUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id, username, name, gender, dob, email, phone, address, status } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "UserId is required" });
    }
    const existUser = await User.findByPk(id);
    if (!existUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (email) {
      const existEmail = await User.findAll({
        where: {
          email: email,
          id: { [Op.ne]: id }, // loai tru email da ton tai
        },
      });
      if (existEmail.length > 0) {
        return res.status(400).json({
          message: `Email ${email} is existing`,
        });
      }
    }
    if (phone) {
      const existPhone = await User.findAll({
        where: {
          phone: phone,
          id: { [Op.ne]: id }, // loai tru email da ton tai
        },
      });
      if (existPhone.length > 0) {
        return res.status(400).json({
          message: `Phone ${phone} is existing`,
        });
      }
    }
    //username, name, gender, dob, email, phone, address, status
    const updateUser = {};
    if (username != undefined) updateUser.username = username;
    if (name != undefined) updateUser.name = name;
    if (gender != undefined) updateUser.gender = gender;
    if (dob != undefined) updateUser.dob = dob;
    if (address != undefined) updateUser.address = address;
    if (status != undefined) updateUser.status = status;

    await User.update(updateUser, { where: { id: id } });
    await User.findByPk(id);
    return res.status(202).json({
      status: 202,
      message: "user updated successfully",
      data: "",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id, currentPassword, password, confirmPassword } = req.body;

    if (!id || !currentPassword || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Missing information to change password" });
    }
    // kiem tra user ton tai
    const existUser = await User.findByPk(id);
    if (!existUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    //so sanh password hien tai
    const isMatch = await bcrypt.compare(currentPassword, existUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    //so sanh new password voi cf password
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are not the same",
      });
    }
    // hash password va update user
    const hashPassword = await bcrypt.hash(password, 12);
    await User.update(
      { password: hashPassword, username: password },
      { where: { id: id } }
    );
    return res.status(202).json({
      status: 202,
      message: "user change password successfully",
      data: "",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.changeStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "Missing id or status information" });
    }

    // kiem tra user ton tai
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // update status
    await User.update({ status }, { where: { id } });

    return res.status(202).json({
      status: 202,
      message: "user change status successfully",
      data: "",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.uploadImage = (req, res, next) => {
  const avatars = req.files;

  if (!avatars || avatars.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "No files uploaded",
    });
  }

  uploadAvatar(avatars)
    .then(() =>
      res.status(201).json({
        status: 201,
        message: "upload images successfully",
      })
    )
    .catch((err) => {
      console.error("Upload error:", err);
      res.status(500).json({
        status: 500,
        message: "File upload failed",
        error: err.message,
      });
    });
};
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // kiem tra user ton tai
    const existUser = await User.findOne({ where: { id: userId } });
    if (!existUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    // Lay role_id va Role name cua user
    const { role_id } = await UserHasRole.findOne({
      where: { user_id: userId },
    });
    const { name } = await Role.findOne({ where: { id: role_id } });
    //Xoa tung bang cua nguoi dung
    if (name === "PARENT") await Parent.destroy({ where: { user_id: userId } });
    if (name === "DRIVER") await Driver.destroy({ where: { user_id: userId } });
    if (name === "ASSISTANT")
      await Assistant.destroy({ where: { user_id: userId } });
    if (name === "TEACHER")
      await Teacher.destroy({ where: { user_id: userId } });
    //Xoa bang user_has_role
    await UserHasRole.destroy({ where: { user_id: userId } });
    //Xoa User
    const userDelete = await User.destroy({ where: { id: userId } });
    if (userDelete > 0) {
      return res.status(202).json({
        status: 202,
        message: "User deleted successfully",
        data: "",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "User not found or already deleted",
        data: "",
      });
    }
  } catch (err) {
    console.error("Delete user failed:", err); // log đầy đủ

    res.status(500).json({
      status: 500,
      message: "Delete user failed",
      error: err?.message || "Internal server error",
    });
  }
};
exports.getEntityByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // kiem tra user ton tai
    const existUser = await User.findOne({ where: { id: userId } });
    if (!existUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    // Lay role_id va Role name cua user
    const { role_id } = await UserHasRole.findOne({
      where: { user_id: userId },
    });
    const { name } = await Role.findOne({ where: { id: role_id } });
    let entity = null;
    //kiem tra role cua user
    if (name === "PARENT")
      entity = await Parent.findOne({ where: { user_id: userId } });
    else if (name === "DRIVER")
      entity = await Driver.findOne({ where: { user_id: userId } });
    else if (name === "ASSISTANT")
      entity = await Assistant.findOne({ where: { user_id: userId } });
    else if (name === "TEACHER")
      entity = await Teacher.findOne({ where: { user_id: userId } });
    else entity = null;
    const data = {
      id: entity.id,
      createdAt: entity.createdAt,
      updateAt: entity.updateAt,
      user: {
        existUser,
        roleName: name,
        accountNonExpired: true,
        credentialsNonExpired: true,
        accountNonLocked: true,
      },
    };
    return res.status(200).json({
      status: 200,
      message: "get entity by user ID",
      data: data,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};
