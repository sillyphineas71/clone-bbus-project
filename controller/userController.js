const {
  tbl_user: User,
  tbl_role: Role,
  tbl_user_has_role: UserHasRole,
} = require("../model");
// const {
//   tbl_driver: Driver,
//   tbl_parent: Parent,
//   tbl_teacher: Teacher,
//   tbl_assistant: Assistant,
// } = require("../model");
const { Op, where } = require("sequelize");
// const { v4: uuidv4 } = require("uuid");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
// const xlsx = require("xlsx");
// const fs = require("fs");
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

exports.getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.userId);
    if (result.status !== 200) {
      return res
        .status(result.status)
        .json({ status: result.status, message: result.message });
    }
    res
      .status(200)
      .json({ status: 200, message: "get user detail", data: result.user });
  } catch (err) {
    next(err);
  }
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
    return res.status(500).json({ message: err.message });
  }
};

exports.importUsers = async (req, res, next) => {
  try {
    const result = await userService.importUsers(
      req.file,
      req.body.roleName,
      req.body
    );
    if (result.status !== 202) {
      return res.status(result.status).json(result);
    }
    return res.status(202).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.body);
    return res.status(result.status).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.body);
    return res.status(result.status).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const result = await userService.changeStatus(req.body);
    return res.status(result.status).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.uploadImage = (req, res, next) => {
  const avatars = req.files;

  if (!avatars || avatars.length === 0) {
    return res.status(400).json({ status: 400, message: "No files uploaded" });
  }
  userService
    .uploadAvatar(avatars)
    .then(() =>
      res
        .status(201)
        .json({ status: 201, message: "upload images successfully" })
    )
    .catch((err) => {
      res.status(500).json({
        status: 500,
        message: "File upload failed",
        error: err.message,
      });
    });
};


exports.updateAvatarUserLoggedIn = async (req, res, next) => {
  const userId = req.userId;
  const avatars = req.files;

  if (!avatars || avatars.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "No files uploaded",
    });
  }

  const avatar = avatars[0];
  userService
    .updateAvatarUserLoggedIn(userId, avatar)
    .then((avatarUrl) => {
      res.status(202).json({
        status: 202,
        message: "User updated successfully",
        data: avatarUrl,
      });
    })
    .catch((err) => next(err));
}

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.userId);
    return res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Delete user failed",
      error: err?.message || "Internal server error",
    });
  }
};

exports.getEntityByUserId = async (req, res, next) => {
  try {
    const result = await userService.getEntityByUserId(req.params.userId);
    return res.status(result.status).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};
