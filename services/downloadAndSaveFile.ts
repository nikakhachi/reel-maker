const fs = require("fs");
const axios = require("axios").default;
const tmp = require("tmp");

export const downloadAndSaveFile = async (fileUrl: any, outputLocationPath: any) => {
  if (!outputLocationPath) {
    outputLocationPath = tmp.fileSync({ mode: 0o644, prefix: "kuzzle-listener-", postfix: ".jpg" });
  }
  let path = typeof outputLocationPath === "object" ? outputLocationPath.name : outputLocationPath;
  const writer = fs.createWriteStream(path);
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  return new Promise((resolve, reject) => {
    if (response.data instanceof Buffer) {
      writer.write(response.data);
      resolve(outputLocationPath.name);
    } else {
      response.data.pipe(writer);
      let error: any = null;
      writer.on("error", (err: any) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(outputLocationPath.name);
        }
      });
    }
  });
};

// import * as https from "https";
// import * as fs from "fs";

// export const downloadAndSaveFile = (url: string, filePath: string) =>
//   new Promise((resolve, reject) => {
//     https.get(url, (res) => {
//       const writeStream = fs.createWriteStream(filePath);

//       res.pipe(writeStream);

//       writeStream.on("finish", () => {
//         writeStream.close();
//         console.log("Download Completed");
//         resolve("");
//       });

//       writeStream.on("error", reject);
//     });
//   });
