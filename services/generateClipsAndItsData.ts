import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import { writeFile } from "fs";
import { executeBash } from "./executeBash";
import logger from "../utils/logger";

export const generateClipsAndItsData = async (nlpData: any, videoId: string) => {
  const currentWorkingDir = process.cwd();

  fs.mkdirSync(path.resolve(path.join(currentWorkingDir, videoId)));
  fs.mkdirSync(path.resolve(path.join(currentWorkingDir, videoId, "chapters")));
  fs.mkdirSync(path.resolve(path.join(currentWorkingDir, videoId, "iabs")));

  const chapterDirectory = `${currentWorkingDir}/${videoId}/chapters/`;
  const iabsDirectory = `${currentWorkingDir}/${videoId}/iabs/`;

  for (const chapter of nlpData.chapters) {
    const chapterId = v4();
    console.log(`Generating Chapter : ${chapter.gist}`);
    const reelSubtitles = nlpData.words
      .slice(
        nlpData.words.findIndex((item: any) => item.start === chapter.start),
        nlpData.words.findIndex((item: any) => item.end === chapter.end) + 1
      )
      .map((item: any) => ({ ...item, start: item.start - chapter.start, end: item.end - chapter.start }));
    fs.mkdirSync(path.resolve(path.join(currentWorkingDir, videoId, "chapters", chapterId)));
    writeFile(`${chapterDirectory}/${chapterId}/subtitles.json`, JSON.stringify(reelSubtitles, null, 2), (err) => err && console.log(err));
    writeFile(`${chapterDirectory}/${chapterId}/metadata.json`, JSON.stringify(chapter, null, 2), (err) => err && console.log(err));
    await executeBash(
      `ffmpeg -i ${currentWorkingDir}/output.mp4 -ss ${chapter.start / 1000} -to ${
        chapter.end / 1000
      } ${chapterDirectory}/${chapterId}/reel.mp4`
    );
    console.log(`Chapter ${chapter.gist} has generated`);
  }

  if (nlpData.iab_categories_result.status === "success") {
    for (const iab of nlpData.iab_categories_result.results) {
      const iabId = v4();
      console.log(`Generating Iab : ${iabId}`);
      const reelSubtitles = nlpData.words
        .slice(
          nlpData.words.findIndex((item: any) => item.start === iab.timestamp.start),
          nlpData.words.findIndex((item: any) => item.end === iab.timestamp.end) + 1
        )
        .map((item: any) => ({ ...item, start: item.start - iab.timestamp.start, end: item.end - iab.timestamp.start }));
      fs.mkdirSync(path.resolve(path.join(currentWorkingDir, videoId, "iabs", iabId)));
      writeFile(`${iabsDirectory}/${iabId}/subtitles.json`, JSON.stringify(reelSubtitles, null, 2), (err) => err && console.log(err));
      writeFile(`${iabsDirectory}/${iabId}/metadata.json`, JSON.stringify(iab, null, 2), (err) => err && console.log(err));
      await executeBash(
        `ffmpeg -i ${currentWorkingDir}/output.mp4 -ss ${iab.timestamp.start / 1000} -to ${
          iab.timestamp.end / 1000
        } ${iabsDirectory}/${iabId}/reel.mp4`
      );
      console.log(`Iab ${iabId} has generated`);
    }
  } else {
    logger.error(`iab categories status is ${nlpData.iab_categories_result.status}`);
  }
};
