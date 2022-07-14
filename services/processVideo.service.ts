import { downloadAndSaveFile } from "./downloadAndSaveFile";
import { getNlpResultsForAudio } from "./getNlpResultsForAudio";
import { generateClipsAndItsData } from "./generateClipsAndItsData";
import { executeBash } from "./executeBash";
import logger from "../utils/logger";
import * as fs from "fs";
import path from "path";
import { FILE_PROCESSING_FOLDER, NODEJS_ROOT_FOLDER } from "../constants";
import { v4 } from "uuid";

export const processVideo = async (videoId: string, mp3Url: string, mp4Url: string) => {
  try {
    const generatedVideoId = `${videoId}_${v4()}`;

    fs.mkdirSync(path.resolve(path.join(NODEJS_ROOT_FOLDER, FILE_PROCESSING_FOLDER, generatedVideoId)));
    const videoFolder = `${NODEJS_ROOT_FOLDER}/${FILE_PROCESSING_FOLDER}/${generatedVideoId}`;
    const fullMp4Path = `${videoFolder}/${generatedVideoId}.mp4`;
    const fullMp3Path = `${videoFolder}/${generatedVideoId}.mp3`;
    const fullOutputPath = `${videoFolder}/${generatedVideoId + "__output"}.mp4`;
    logger.info(`Downloading Mp3 and Mp4..`);
    await Promise.all([downloadAndSaveFile(mp4Url, fullMp4Path), downloadAndSaveFile(mp3Url, fullMp3Path)]);
    logger.info(`Mixing Mp4 and Mp3..`);
    await executeBash(`ffmpeg -i ${fullMp4Path} -i ${fullMp3Path} -map 0:v -map 1:a -c:v copy -shortest ${fullOutputPath}`);
    logger.info("Getting Nlp Results..");
    const nlp = await getNlpResultsForAudio(mp3Url);
    fs.writeFile(`${videoFolder}/${generatedVideoId}_NLP.ts`, JSON.stringify(nlp, null, 2), (err) => {});
    logger.info(`Generating Clips..`);
    await generateClipsAndItsData(nlp, videoFolder, fullOutputPath, generatedVideoId);
    fs.rmdirSync(videoFolder, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

// https://www.youtube.film/Downloads/c/9/e/d/6/6/1/7/b/3/6/5/4/2/f/e/8/d/6/8/c/2/5/7/7/5/e/1/a/8/8/f/How_The_New_World_Order_Works.mp3
// https://redirector.googlevideo.com/videoplayback?expire=1657823458&ei=ggzQYqnjB4yjgQf4uJrwBg&ip=49.12.104.180&id=o-ABCr30OKtp2sOm4aj-c-r6HHl1WMKc5Na9k-dXRNvbaA&itag=22&source=youtube&requiressl=yes&mh=wp&mm=31%2C29&mn=sn-4g5lzne6%2Csn-4g5edndl&ms=au%2Crdu&mv=u&mvi=4&pl=26&vprv=1&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=358.144&lmt=1656727793265373&mt=1657800741&fvip=4&fexp=24001373%2C24007246&c=ANDROID&txp=5532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAMu_7HGw3sDnXeCBF8R6TxOyYJ03lrqpBArx93HHZPRvAiAlloRj-OnM8gdp9T5G95Q859DiM6e5bYp0IDDEc_G8cA%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRQIhANJj3m5Fy3V4etduppu7nI20b-SPonmPAz790yy8uuayAiBbCnPZ_ARryrVJcupv_sngZpnaeFm0rZgFDQvmajcjsA%3D%3D&utmg=ytap1_82CQbKC7U0w

// processVideo(
//   "m12fBgVyp2s",
//   "https://www.youtube.film/Downloads/c/9/e/6/c/9/0/7/7/0/a/8/e/7/b/1/7/6/b/6/8/a/8/1/f/c/0/5/a/9/3/5/How_I_Spend_Money_Invest_in_Myself.mp3",
//   "https://redirector.googlevideo.com/videoplayback?expire=1657843738&ei=ulvQYoW-LYLZgQekxq7IDA&ip=49.12.104.180&id=o-AHi9sXcXpC_ff68oe-fOF9KOTQ3yxZG0Nzfo-1k8yQgC&itag=22&source=youtube&requiressl=yes&mh=q_&mm=31%2C26&mn=sn-4g5ednsr%2Csn-f5f7lnld&ms=au%2Conr&mv=u&mvi=4&pl=26&vprv=1&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=829.300&lmt=1584171842716105&mt=1657821575&fvip=3&fexp=24001373%2C24007246&c=ANDROID&txp=6211222&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAIv7mNUoNSEr7PNwUs5Q8gKkl4OlSU8edipXju9sFhisAiAmn3I8wesWJHRYM_bxrKC50ymtU_fjNTswSYjAbMEOMw%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRgIhAM5Mn-8MdCcHL2mTs-LKIrkdbHW4C5k-pIM71FCZM8MyAiEAjeFJaC0IlNHMo8N58AjJY-zlAAx5QdVmYgWugyCojnM%3D&utmg=ytap1_m12fBgVyp2s"
// );
