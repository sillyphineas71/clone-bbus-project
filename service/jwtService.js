require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Buffer } = require("buffer");

const expiryMinutes = parseInt(process.env.JWT_EXPIRY_MINUTES, 10);
const expiryDays = parseInt(process.env.JWT_EXPIRY_DAYS, 10);
const accessKey = Buffer.from(process.env.JWT_ACCESS_KEY, "base64");
const refreshKey = Buffer.from(process.env.JWT_REFRESH_KEY, "base64");

module.exports.generateAccessToken = (phone, userId) => {
  const payload = {
    userId,
  };
  return jwt.sign(payload, accessKey, {
    algorithm: "HS256",
    subject: phone,
    expiresIn: `${expiryMinutes}m`,
  });
};

module.exports.generateRefreshToken = (phone, userId) => {
  const payload = {
    userId,
  };
  return jwt.sign(payload, refreshKey, {
    algorithm: "HS256",
    subject: phone,
    expiresIn: `${expiryDays}d`,
  });
};
