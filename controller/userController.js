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
exports.createUser = (req, res, next) => {
  const { email, phone, name, gender, dob, address, role } = req.body;

  //Xử lý avatar
  const avatar = req.file ? req.file.originalname : null;
  //Xử lý password và hashpassword
  const rawPassword = crypto.randomBytes(6).toString("base64");
  bcrypt
    .hash(rawPassword, 12)
    .then((hashPassword) => {
      //tao user
      return User.create({
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
    })
    .then((user) => {
      // gan role
      const roleUser = Role.findOne({ where: { name: role } });
      const userHasRole = UserHasRole.create({
        id: uuidv4(),
        role_id: roleUser.id,
        user_id: user.id,
      });
      // Tạo entity phụ
      if (role === "PARENT") Parent.create({ id: uuidv4(), userId: user.id });
      if (role === "DRIVER") Driver.create({ id: uuidv4(), userId: user.id });
      if (role === "ASSISTANT")
        Assistant.create({ id: uuidv4(), userId: user.id });
      if (role === "TEACHER") Teacher.create({ id: uuidv4(), userId: user.id });

      return res.status(201).json({
        status: 201,
        message: "user created successfully",
        data: user.id,
      });
    })

    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
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
