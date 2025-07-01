const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

module.exports.uploadFile = function (key, buffer, size, contentType) {
  return s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentLength: size,
      ContentType: contentType,
    })
  );
};
