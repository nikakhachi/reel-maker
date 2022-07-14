import { config, S3 } from "aws-sdk";

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new S3();

export const uploadToS3 = (fileKey: string, file: Buffer) =>
  new Promise((res, rej) => {
    s3.putObject(
      {
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: fileKey,
        Body: file,
      },
      (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      }
    );
  });
