const { TblUser, TblRole } = require("../model");
const { Op } = require("sequelize");

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
      model: TblRole,
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

  TblUser.findAndCountAll({
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
    .catch((err) => next(err));
};
