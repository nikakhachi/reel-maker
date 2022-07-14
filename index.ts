import * as dotenv from "dotenv";
dotenv.config();
import { downloadAndSaveFile } from "./downloadAndSaveFile";
import { getMp3LinkOfYoutubeVideo } from "./getMp3LinkOfYoutubeVideo";
import { getNlpResultsForAudio } from "./getNlpResultsForAudio";
import { generateClipsAndItsData } from "./generateClipsAndItsData";
import { getMP4LinkOfYoutubeVideo } from "./getMp4LinkOfYoutubeVideo";
import { executeBash } from "./executeBash";
import logger from "./logger";
import { writeFile } from "fs";
import { nlpData } from "./data/nlpresponse";

(async () => {
  try {
    logger.info("");
    const videoId = "m12fBgVyp2s";
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
