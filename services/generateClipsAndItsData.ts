import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import { cutVideo } from "./ffmpeg.service";
import { uploadToS3 } from "../aws";

export const generateClipsAndItsData = async (nlpData: any, videoFolder: string, originalVideoPath: string, videoId: string) => {
  fs.mkdirSync(path.resolve(path.join(videoFolder, "clips")));
  fs.mkdirSync(path.resolve(path.join(videoFolder, "shorts")));

  const clipsDirectory = `${videoFolder}/clips/`;
  const shortsDirectory = `${videoFolder}/shorts/`;

  for (const chapter of nlpData.chapters) {
    const clipId = v4();
    const s3Path = `${videoId}/clips/${clipId}`;

    logger.info(`Generating Clip : ${chapter.gist}`);

    const subtitles = nlpData.words
      .slice(
        nlpData.words.findIndex((item: any) => item.start === chapter.start),
        nlpData.words.findIndex((item: any) => item.end === chapter.end) + 1
      )
      .map((item: any) => ({ ...item, start: item.start - chapter.start, end: item.end - chapter.start }));

    fs.mkdirSync(path.resolve(path.join(clipsDirectory, clipId)));

    logger.debug("trimming video");
    const outputPath = `${clipsDirectory}/${clipId}/video.mp4`;
    await cutVideo(originalVideoPath, outputPath, chapter.start / 1000, chapter.end / 1000 - chapter.start / 1000);

    const newVideo: Buffer = await new Promise((res, rej) => {
      fs.readFile(outputPath, (err, data) => {
        if (err) return rej(err);
        res(data);
      });
    });

    fs.unlink(outputPath, (err) => {
      if (err) logger.error(`Error deleting ${outputPath}`);
    });

    logger.debug("uploading to s3");
    await Promise.all([
      uploadToS3(`${s3Path}/video.mp4`, newVideo),
      uploadToS3(`${s3Path}/subtitles.json`, Buffer.from(JSON.stringify(subtitles), "utf-8")),
      uploadToS3(`${s3Path}/metadata.json`, Buffer.from(JSON.stringify(chapter), "utf-8")),
    ]);

    logger.info(`Clip ${chapter.gist} has generated`);
  }

  if (nlpData.iab_categories_result.status === "success") {
    for (const iab of nlpData.iab_categories_result.results) {
      const shortId = v4();
      const s3Path = `${videoId}/shorts/${shortId}`;

      logger.info(`Generating Short : ${shortId}`);

      const subtitles = nlpData.words
        .slice(
          nlpData.words.findIndex((item: any) => item.start === iab.timestamp.start),
          nlpData.words.findIndex((item: any) => item.end === iab.timestamp.end) + 1
        )
        .map((item: any) => ({ ...item, start: item.start - iab.timestamp.start, end: item.end - iab.timestamp.start }));

      fs.mkdirSync(path.resolve(path.join(shortsDirectory, shortId)));

      logger.debug("trimming video");
      const outputPath = `${shortsDirectory}/${shortId}/video.mp4`;
      await cutVideo(originalVideoPath, outputPath, iab.timestamp.start / 1000, iab.timestamp.end / 1000 - iab.timestamp.start / 1000);

      const newVideo: Buffer = await new Promise((res, rej) => {
        fs.readFile(outputPath, (err, data) => {
          if (err) return rej(err);
          res(data);
        });
      });

      fs.unlink(outputPath, (err) => {
        if (err) logger.error(`Error deleting ${outputPath}`);
      });

      logger.debug("uploading to s3");
      await Promise.all([
        uploadToS3(`${s3Path}/video.mp4`, newVideo),
        uploadToS3(`${s3Path}/subtitles.json`, Buffer.from(JSON.stringify(subtitles), "utf-8")),
        uploadToS3(`${s3Path}/metadata.json`, Buffer.from(JSON.stringify(iab), "utf-8")),
      ]);

      logger.info(`short ${shortId} has generated`);
    }
  } else {
    logger.error(`iab categories status is ${nlpData.iab_categories_result.status}`);
  }
};
