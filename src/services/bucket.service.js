const fs = require("fs");
const AWS = require("aws-sdk");
const config = require("../config");

const s3 = new AWS.S3({
  endpoint: "https://s3.fr-par.scw.cloud",
  accessKeyId: config.BUCKET_ACCESS_KEY_ID,
  secretAccessKey: config.BUCKET_SECRET_KEY,
});

module.exports = {
  async upload(key, path) {
    const stream = fs.createReadStream(path);

    const params = {
      ACL: "public-read",
      Bucket: config.BUCKET_NAME,
      Key: key,
      Body: stream,
    };

    const data = await s3.upload(params).promise();
    stream.destroy();
    return data.Location;
  },
};
