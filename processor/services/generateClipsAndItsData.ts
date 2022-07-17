import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import { cutVideo } from "./ffmpeg.service";
import { uploadToS3 } from "../aws";
import { getVideoDurationInSeconds } from "get-video-duration";

interface IArguments {
  nlpData: any;
  videoFolder: string;
  originalVideoPath: string;
  videoId: string;
  videoUrl: string;
}

export const generateClipsAndItsData = async ({ nlpData, originalVideoPath, videoFolder, videoId, videoUrl }: IArguments) => {
  const originalVideoDurationInSeconds = await getVideoDurationInSeconds(videoUrl);

  fs.mkdirSync(path.resolve(path.join(videoFolder, "clips")));
  fs.mkdirSync(path.resolve(path.join(videoFolder, "shorts")));

  const clipsDirectory = `${videoFolder}/clips/`;
  const shortsDirectory = `${videoFolder}/shorts/`;

  const processedVideos: {
    clips: {
      gist: string;
      headline: string;
      summary: string;
      videoUrl: string;
      subtitlesUrl: string;
    }[];
    shorts: {
      text: string;
      label: string;
      videoUrl: string;
      subtitlesUrl: string;
    }[];
  } = { clips: [], shorts: [] };

  let clipIndex = 1;
  for (const chapter of nlpData.chapters) {
    const clipDuration = chapter.end / 1000 - chapter.start / 1000;

    if ((originalVideoDurationInSeconds * 2) / 3 > clipDuration) {
      const clipGistForFolderAndFileName = `${chapter.gist.replace(/\s/gi, "_")}_${clipIndex}`;
      const s3Path = `${videoId}/clips/${clipGistForFolderAndFileName}`;

      logger.info(`Generating Clip : ${chapter.gist}`);

      const subtitles = nlpData.words
        .slice(
          nlpData.words.findIndex((item: any) => item.start === chapter.start),
          nlpData.words.findIndex((item: any) => item.end === chapter.end) + 1
        )
        .map((item: any) => ({ ...item, start: item.start - chapter.start, end: item.end - chapter.start }));

      fs.mkdirSync(path.resolve(path.join(clipsDirectory, String(clipIndex))));

      logger.info("trimming video");
      const outputPath = `${clipsDirectory}/${clipIndex}/video.mp4`;
      await cutVideo(originalVideoPath, outputPath, chapter.start / 1000, clipDuration);

      const newVideo: Buffer = await new Promise((res, rej) => {
        fs.readFile(outputPath, (err, data) => {
          if (err) return rej(err);
          res(data);
        });
      });

      fs.unlink(outputPath, (err) => {
        if (err) logger.error(`Error deleting ${outputPath}`);
      });

      logger.info("uploading to s3");
      const videoS3Path = `${s3Path}/${clipGistForFolderAndFileName}.mp4`;
      const subtitlesS3Path = `${s3Path}/${clipGistForFolderAndFileName}-subtitles.json`;

      await Promise.all([uploadToS3(videoS3Path, newVideo), uploadToS3(subtitlesS3Path, Buffer.from(JSON.stringify(subtitles), "utf-8"))]);

      processedVideos.clips.push({
        videoUrl: videoS3Path,
        subtitlesUrl: subtitlesS3Path,
        gist: chapter.gist,
        summary: chapter.summary,
        headline: chapter.headline,
      });

      clipIndex++;
      logger.info(`Clip ${chapter.gist} has generated`);
    } else {
      logger.info(`Clip \`${chapter.gist}\` is more than 2/3 of original video, skipping`);
    }
  }

  if (nlpData.iab_categories_result.status === "success") {
    let iabIndex = 1;
    for (const iab of nlpData.iab_categories_result.results) {
      const iabLabel = iab.labels[0].label
        .split(">")
        .slice(-1)[0]
        .split(/(?=[A-Z])/)
        .join(" ");
      const iabLabelForFileAndFolderName = `${iabLabel.replace(/\s/gi, "_")}_${iabIndex}`;
      const s3Path = `${videoId}/shorts/${iabLabelForFileAndFolderName}`;

      logger.info(`Generating Short : ${iabLabel}`);

      const subtitles = nlpData.words
        .slice(
          nlpData.words.findIndex((item: any) => item.start === iab.timestamp.start),
          nlpData.words.findIndex((item: any) => item.end === iab.timestamp.end) + 1
        )
        .map((item: any) => ({ ...item, start: item.start - iab.timestamp.start, end: item.end - iab.timestamp.start }));

      fs.mkdirSync(path.resolve(path.join(shortsDirectory, String(iabIndex))));

      logger.info("trimming video");
      const outputPath = `${shortsDirectory}/${iabIndex}/video.mp4`;
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

      logger.info("uploading to s3");
      const videoS3Path = `${s3Path}/${iabLabelForFileAndFolderName}.mp4`;
      const subtitlesS3Path = `${s3Path}/${iabLabelForFileAndFolderName}-subtitles.json`;

      await Promise.all([uploadToS3(videoS3Path, newVideo), uploadToS3(subtitlesS3Path, Buffer.from(JSON.stringify(subtitles), "utf-8"))]);
      processedVideos.shorts.push({
        videoUrl: videoS3Path,
        subtitlesUrl: subtitlesS3Path,
        text: iab.text,
        label: iabLabel,
      });

      iabIndex++;
      logger.info(`short '${iabLabel}' has generated`);
    }
  } else {
    logger.error(`iab categories status is ${nlpData.iab_categories_result.status}`);
  }

  return processedVideos;
};
