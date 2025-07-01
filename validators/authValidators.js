const jwt = require("jsonwebtoken");
const { tbl_user_has_role: UserHasRole, tbl_role: Role } = require("../model");

module.exports.isAuth = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "uiaaa");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.id;
  next();
};

module.exports = function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const userId = req.userId;
    UserHasRole.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
          where: { name: allowedRoles },
        },
      ],
    })
      .then((records) => {
        if (records.length === 0) {
          return res.status(403).json({
            status: 403,
            message: "You don't have the required role",
          });
        }
        next();
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          status: 500,
          message: "Server error",
        });
      });
  };
};
