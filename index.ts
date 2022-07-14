import * as dotenv from "dotenv";
dotenv.config();
import { downloadAndSaveFile } from "./services/downloadAndSaveFile";
import { getMp3LinkOfYoutubeVideo } from "./services/getMp3LinkOfYoutubeVideo";
import { getNlpResultsForAudio } from "./services/getNlpResultsForAudio";
import { generateClipsAndItsData } from "./services/generateClipsAndItsData";
import { getMP4LinkOfYoutubeVideo } from "./services/getMp4LinkOfYoutubeVideo";
import { executeBash } from "./services/executeBash";
import logger from "./utils/logger";
import { writeFile } from "fs";

(async () => {
  try {
    logger.info("");
    const videoId = "82CQbKC7U0w";
    logger.info(videoId);
    const videoUrl = await getMP4LinkOfYoutubeVideo(videoId);
    logger.info(videoUrl);
    const mp3Url = await getMp3LinkOfYoutubeVideo(`https://www.youtube.com/watch?v=${videoId}`);
    logger.info(mp3Url);
    await Promise.all([downloadAndSaveFile(videoUrl, "video.mp4"), downloadAndSaveFile(mp3Url, "audio.mp3")]);
    await executeBash(`ffmpeg -i video.mp4 -i audio.mp3 -map 0:v -map 1:a -c:v copy -shortest output.mp4`);
    logger.info("aaa");
    const nlp = await getNlpResultsForAudio(mp3Url);
    writeFile(`./nlpresponse${videoId}.json`, JSON.stringify(nlp, null, 2), (err) => console.log(err));
    logger.info("aaaww");
    await generateClipsAndItsData(nlp, videoId);
    logger.info("bbasdasd");
  } catch (error) {
    console.log(error);
  }
})();
