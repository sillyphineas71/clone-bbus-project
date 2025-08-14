const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

module.exports.getPresignedUrl = function (key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 360000 });
};
module.exports.generatePresignedUrl = async function (key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  const durationMinutes = parseInt(process.env.AWS_DURATION_MINUTES);
  // durationMinutes -> giây
  const expiresInSeconds = durationMinutes * 60;

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};
