// src/service/authService.js
const { tbl_user: User } = require("../model");
const bcrypt = require("bcrypt");
const jwtService = require("./jwtService");
const LoginResponse = require("../model/dto/response/auth/LoginResponse");

module.exports.login = (SignInRequest) => {
  return User.findOne({ where: { phone: SignInRequest.phone } })
    .then((user) => {
      if (!user) {
        return Promise.reject({
          status: 404,
          message: "User not found",
        });
      } else {
        return bcrypt
          .compare(SignInRequest.password, user.password)
          .then((isMatch) => {
            if (!isMatch) {
              return Promise.reject({
                status: 401,
                message: "Invalid password",
              });
            }
            if (SignInRequest.deviceToken) {
              user.deviceToken = SignInRequest.deviceToken;
              return user.save();
            }
            return user;
          });
      }
    })
    .then((user) => {
      const accessToken = jwtService.generateAccessToken(user.phone, user.id);
      const refreshToken = jwtService.generateRefreshToken(user.phone, user.id);
      const message = "Login successful";
      return new LoginResponse(message, accessToken, refreshToken);
    });
};

exports.getRefreshToken = (refreshToken) => {
  console.info("Get refresh token");
  if (!refreshToken) {
    throw createError(400, "Token must be not blank");
  }

  const phone = jwtService.extractPhone(refreshToken, "REFRESH_TOKEN");
  return User.findOne({ where: { phone } })
    .then((user) => {
      if (!user) {
        return Promise.reject(createError(404, "User not found"));
      }
      const accessToken = jwtService.generateAccessToken(user.phone, user.id);
      return {
        accessToken,
        refreshToken,
      };
    })
    .catch((err) => {
      throw createError(403, `Access denied: ${err.message}`);
    });
};
