require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Buffer } = require("buffer");
const createError = require("http-errors");

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

module.exports.extractPhone = (token, type) => {
  return extractClaim(token, type, (claims) => {
    if (!claims.sub) {
      throw createError(400, "Sub is missing in token");
    }
    return claims.sub;
  });
};

function extractAllClaims(token, type) {
  try {
    return jwt.verify(token, getKey(type));
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw createError(401, `Token expired: ${err.message}`);
    }
    throw createError(403, `Access denied: ${err.message}`);
  }
}

function extractClaim(token, type, claimResolver) {
  const claims = extractAllClaims(token, type);
  return claimResolver(claims);
}

function getKey(type) {
  switch (type) {
    case "ACCESS_TOKEN":
      return accessKey;
    case "REFRESH_TOKEN":
      return refreshKey;
    default:
      throw createError(400, `Unknown token type: ${type}`);
  }
}
