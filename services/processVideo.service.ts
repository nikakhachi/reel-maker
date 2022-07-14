import { downloadAndSaveFile } from "./downloadAndSaveFile";
import { getNlpResultsForAudio } from "./getNlpResultsForAudio";
import { generateClipsAndItsData } from "./generateClipsAndItsData";
import { executeBash } from "./executeBash";
import logger from "../utils/logger";
import * as fs from "fs";
import path from "path";
import { FILE_PROCESSING_FOLDER, NODEJS_ROOT_FOLDER } from "../constants";
// import { nlp } from "./nlpresponse82CQbKC7U0w";
import { habozo } from "../habozojson";

export const processVideo = async (videoId: string, mp3Url: string, mp4Url: string) => {
  try {
    fs.mkdirSync(path.resolve(path.join(NODEJS_ROOT_FOLDER, FILE_PROCESSING_FOLDER, videoId)));
    const videoFolder = `${NODEJS_ROOT_FOLDER}/${FILE_PROCESSING_FOLDER}/${videoId}`;
    const fullMp4Path = `${videoFolder}/${videoId}.mp4`;
    const fullMp3Path = `${videoFolder}/${videoId}.mp3`;
    const fullOutputPath = `${videoFolder}/${videoId + "__output"}.mp4`;
    logger.info(`Downloading Mp3 and Mp4..`);
    await Promise.all([downloadAndSaveFile(mp4Url, fullMp4Path), downloadAndSaveFile(mp3Url, fullMp3Path)]);
    logger.info(`Mixing Mp4 and Mp3..`);
    await executeBash(`ffmpeg -i ${fullMp4Path} -i ${fullMp3Path} -map 0:v -map 1:a -c:v copy -shortest ${fullOutputPath}`);
    logger.info("Getting Nlp Results..");
    const nlp = await getNlpResultsForAudio(mp3Url);
    fs.writeFile(`${videoFolder}/${videoId}_NLP.ts`, JSON.stringify(nlp, null, 2), (err) => {});
    logger.info(`Generating Clips..`);
    await generateClipsAndItsData(nlp, videoFolder, fullOutputPath);
    // fs.rmdirSync(videoFolder, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

// https://www.youtube.film/Downloads/c/9/e/d/6/6/1/7/b/3/6/5/4/2/f/e/8/d/6/8/c/2/5/7/7/5/e/1/a/8/8/f/How_The_New_World_Order_Works.mp3
// https://redirector.googlevideo.com/videoplayback?expire=1657823458&ei=ggzQYqnjB4yjgQf4uJrwBg&ip=49.12.104.180&id=o-ABCr30OKtp2sOm4aj-c-r6HHl1WMKc5Na9k-dXRNvbaA&itag=22&source=youtube&requiressl=yes&mh=wp&mm=31%2C29&mn=sn-4g5lzne6%2Csn-4g5edndl&ms=au%2Crdu&mv=u&mvi=4&pl=26&vprv=1&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=358.144&lmt=1656727793265373&mt=1657800741&fvip=4&fexp=24001373%2C24007246&c=ANDROID&txp=5532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAMu_7HGw3sDnXeCBF8R6TxOyYJ03lrqpBArx93HHZPRvAiAlloRj-OnM8gdp9T5G95Q859DiM6e5bYp0IDDEc_G8cA%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRQIhANJj3m5Fy3V4etduppu7nI20b-SPonmPAz790yy8uuayAiBbCnPZ_ARryrVJcupv_sngZpnaeFm0rZgFDQvmajcjsA%3D%3D&utmg=ytap1_82CQbKC7U0w

// processVideo(
//   "eEQNcqbATP8",
//   "https://www.youtube.film/Downloads/c/9/e/d/6/6/1/7/b/3/6/5/4/2/f/e/8/d/6/8/c/2/5/7/7/5/e/1/a/8/8/f/How_The_New_World_Order_Works.mp3",
//   "https://redirector.googlevideo.com/videoplayback?expire=1657823458&ei=ggzQYqnjB4yjgQf4uJrwBg&ip=49.12.104.180&id=o-ABCr30OKtp2sOm4aj-c-r6HHl1WMKc5Na9k-dXRNvbaA&itag=22&source=youtube&requiressl=yes&mh=wp&mm=31%2C29&mn=sn-4g5lzne6%2Csn-4g5edndl&ms=au%2Crdu&mv=u&mvi=4&pl=26&vprv=1&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=358.144&lmt=1656727793265373&mt=1657800741&fvip=4&fexp=24001373%2C24007246&c=ANDROID&txp=5532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAMu_7HGw3sDnXeCBF8R6TxOyYJ03lrqpBArx93HHZPRvAiAlloRj-OnM8gdp9T5G95Q859DiM6e5bYp0IDDEc_G8cA%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRQIhANJj3m5Fy3V4etduppu7nI20b-SPonmPAz790yy8uuayAiBbCnPZ_ARryrVJcupv_sngZpnaeFm0rZgFDQvmajcjsA%3D%3D&utmg=ytap1_82CQbKC7U0w"
// );
