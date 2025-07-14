const jwt = require("jsonwebtoken");
require("dotenv").config();
const { tbl_user_has_role: UserHasRole, tbl_role: Role } = require("../model");

const ACCESS_SECRET = Buffer.from(process.env.JWT_ACCESS_KEY, "base64");

module.exports.isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Not authenticated: no Authorization header" });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "Not authenticated: bad Authorization format" });
  }
  const token = parts[1];
  let payload;
  try {
    payload = jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Not authenticated: invalid or expired token" });
  }
  req.userId = payload.userId;
  next();
};

module.exports.checkRole = (...allowedRoles) => {
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
