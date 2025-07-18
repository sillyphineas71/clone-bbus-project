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
