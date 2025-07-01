// services/userService.js
const s3Service = require("./s3Service");

module.exports.uploadAvatar = function (avatars) {
  const prefix = `admins/`;
  const uploads = avatars.map((file) =>
    s3Service.uploadFile(
      prefix + file.originalname,
      file.buffer,
      file.size,
      file.mimetype
    )
  );
  return Promise.all(uploads);
};
