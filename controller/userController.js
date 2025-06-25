const { tbl_user: User, tbl_role: Role, tbl_user_has_role : UserHasRole } = require("../model");
const {tbl_driver: Driver, tbl_parent: Parent, tbl_teacher: Teacher, tbl_assistant: Assistant} = require("../model");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
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
exports.createUser = async (req, res, next) => {
  try {
    const { email, phone, name, gender, dob, address, role } = req.body;
    const avatar = req.file ? req.file.originalname : null;


    // Sinh password ngẫu nhiên và hash
    const rawPassword = crypto.randomBytes(6).toString('base64');
    const hashPassword = await bcrypt.hash(rawPassword, 12);

    //  Tạo user
    const user = await User.create({
      id: uuidv4(),
      name, gender, dob, email, phone, address,
      username: rawPassword,
      password: hashPassword,
      avatar,
      type: 'USER',
      status: 'ACTIVE'
    });

    // Gán role
    const roleUser = await Role.findOne({ where: { name: role } });
    if (!roleUser) {
      return res.status(400).json({ message: 'Role not found' });
    }
    await UserHasRole.create({
      id: uuidv4(),
      role_id: roleUser.id,
      user_id: user.id
    });

    // Tạo entity phụ
    if (role === 'PARENT') await Parent.create({ id: uuidv4(), userId: user.id });
    if (role === 'DRIVER') await Driver.create({ id: uuidv4(), userId: user.id });
    if (role === 'ASSISTANT') await Assistant.create({ id: uuidv4(), userId: user.id });
    if (role === 'TEACHER') await Teacher.create({ id: uuidv4(), userId: user.id });

    //Trả về kết quả
    return res.status(201).json({ status: 201, message: 'user created successfully', data: user.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
