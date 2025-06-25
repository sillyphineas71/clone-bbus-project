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
//POST --- CREATE USER
exports.createUser = (req, res, next) => {
  const { email, phone, name, gender, dob, address, role } = req.body;

   //Xử lý avatar
    const avatar = req.file ? req.file.originalname : null;
  //Xử lý password và hashpassword
  const rawPassword = crypto.randomBytes(6).toString('base64');
  bcrypt.hash(rawPassword ,12)
  .then(hashPassword => {//tao user
   return User.create({
      id: uuidv4(),
      name, gender, dob, email, phone, address,
      username: rawPassword,
      password: hashPassword,
      avatar,
      type: 'USER',
      status: 'ACTIVE'
    });
  }).then(user => { // gan role
    const roleUser = Role.findOne({where : { name :  role  }});
    const userHasRole =  UserHasRole.create({
      id: uuidv4(),
      role_id : roleUser.id,
      user_id : user.id
    });
     // Tạo entity phụ
    if (role === 'PARENT')  Parent.create({ id: uuidv4(),userId: user.id });
    if (role === 'DRIVER')  Driver.create({id: uuidv4(), userId: user.id });
    if (role === 'ASSISTANT')  Assistant.create({ id: uuidv4(),userId: user.id });
    if (role === 'TEACHER')  Teacher.create({ id: uuidv4(),userId: user.id });

        return res.status(201).json({ status: 201, message: 'user created successfully', data: user.id });
  })

    .catch((err) => {
      return res.status(500).json({ message: err.message });

  });

};
