import { config, S3 } from "aws-sdk";
import { Response } from "express";
const s3Zip = require("s3-zip");
const XmlStream = require("xml-stream");

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new S3();

export const downloadS3FolderAsZip = (res: Response, folder: string) => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";

  const params = {
    Bucket: bucket,
    Prefix: folder,
  };

  const filesArray: string[] = [];
  const files = s3.listObjects(params).createReadStream();
  const xml = new XmlStream(files);
  xml.collect("Key");
  xml.on("endElement: Key", (item: any) => {
    filesArray.push(item["$text"].substr(folder.length));
  });

  xml.on("end", () => {
    s3Zip.archive({ region: region, bucket: bucket, preserveFolderStructure: true }, folder, filesArray).pipe(res);
  });
};
