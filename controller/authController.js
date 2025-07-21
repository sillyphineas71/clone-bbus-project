const SignInRequest = require("../model/dto/request/auth/SignInRequest");
const authService = require("../service/authService");

module.exports.getAccessToken = (req, res, next) => {
  let signInRequest;
  try {
    signInRequest = new SignInRequest(req.body);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  authService
    .login(signInRequest)
    .then((loginResponse) => res.json(loginResponse))
    .catch((err) => {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    });
};

module.exports.getRefreshToken = (req, res, next) => {
  const refreshToken = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  authService
    .getRefreshToken(refreshToken)
    .then((newTokens) => {
      console.log(newTokens);
      res.json(newTokens);
    })
    .catch((err) => {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    });
};
