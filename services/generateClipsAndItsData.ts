import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import { writeFile } from "fs";
import { executeBash } from "./executeBash";
import logger from "../utils/logger";

export const generateClipsAndItsData = async (nlpData: any, videoFolder: string, outputVideoPath: string) => {
  fs.mkdirSync(path.resolve(path.join(videoFolder, "clips")));
  fs.mkdirSync(path.resolve(path.join(videoFolder, "shorts")));

  const chapterDirectory = `${videoFolder}/clips/`;
  const iabsDirectory = `${videoFolder}/shorts/`;

  for (const chapter of nlpData.chapters) {
    const clipId = v4();
    logger.info(`Generating Clip : ${chapter.gist}`);
    logger.debug("getting subtitles");
    const reelSubtitles = nlpData.words
      .slice(
        nlpData.words.findIndex((item: any) => item.start === chapter.start),
        nlpData.words.findIndex((item: any) => item.end === chapter.end) + 1
      )
      .map((item: any) => ({ ...item, start: item.start - chapter.start, end: item.end - chapter.start }));
    logger.debug("making folder for clip");
    fs.mkdirSync(path.resolve(path.join(chapterDirectory, clipId)));
    logger.debug("writing subtitles.json");
    writeFile(`${chapterDirectory}/${clipId}/subtitles.json`, JSON.stringify(reelSubtitles, null, 2), (err) => err && console.log(err));
    logger.debug("writing metadata.json");
    writeFile(`${chapterDirectory}/${clipId}/metadata.json`, JSON.stringify(chapter, null, 2), (err) => err && console.log(err));
    logger.debug("trimming video");
    const bashScript = `ffmpeg -i ${outputVideoPath} -ss ${chapter.start / 1000} -to ${
      chapter.end / 1000
    } ${chapterDirectory}/${clipId}/reel.mp4`;
    logger.debug(`executing : ${bashScript}`);
    await executeBash(bashScript);
    logger.info(`Clip ${chapter.gist} has generated`);
  }

  if (nlpData.iab_categories_result.status === "success") {
    for (const iab of nlpData.iab_categories_result.results) {
      const shortId = v4();
      logger.info(`Generating Iab : ${shortId}`);
      logger.debug("getting subtitles");
      const reelSubtitles = nlpData.words
        .slice(
          nlpData.words.findIndex((item: any) => item.start === iab.timestamp.start),
          nlpData.words.findIndex((item: any) => item.end === iab.timestamp.end) + 1
        )
        .map((item: any) => ({ ...item, start: item.start - iab.timestamp.start, end: item.end - iab.timestamp.start }));
      logger.debug("making folder for short");
      fs.mkdirSync(path.resolve(path.join(iabsDirectory, shortId)));
      logger.debug("writing subtitles.json");
      writeFile(`${iabsDirectory}/${shortId}/subtitles.json`, JSON.stringify(reelSubtitles, null, 2), (err) => err && console.log(err));
      logger.debug("writing metadata.json");
      writeFile(`${iabsDirectory}/${shortId}/metadata.json`, JSON.stringify(iab, null, 2), (err) => err && console.log(err));
      logger.debug("trimming video");
      await executeBash(
        `ffmpeg -i ${outputVideoPath} -ss ${iab.timestamp.start / 1000} -to ${
          iab.timestamp.end / 1000
        } ${iabsDirectory}/${shortId}/reel.mp4`
      );
      logger.info(`short ${shortId} has generated`);
    }
  } else {
    logger.error(`iab categories status is ${nlpData.iab_categories_result.status}`);
  }
};
