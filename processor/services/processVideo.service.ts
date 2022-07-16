import { downloadAndSaveFile } from "./downloadAndSaveFile";
import { generateClipsAndItsData } from "./generateClipsAndItsData";
import logger from "../utils/logger";
import * as fs from "fs";
import path from "path";
import { FILE_PROCESSING_FOLDER, NODEJS_ROOT_FOLDER } from "../constants";
import { v4 } from "uuid";
import { getAudioTranscriptResults } from "./assemblyAI.service";
import axios from "axios";

interface IArguments {
  videoId: string;
  mp3Url: string;
  mp4Url: string;
  audioTranscriptId: string;
  youtubeVideoIdInDb: number;
}

export const processVideo = async ({ videoId, mp3Url, mp4Url, audioTranscriptId, youtubeVideoIdInDb }: IArguments) => {
  try {
    const generatedVideoId = `${videoId}_${v4()}`;

    fs.mkdirSync(path.resolve(path.join(NODEJS_ROOT_FOLDER, FILE_PROCESSING_FOLDER, generatedVideoId)));

    const videoFolder = `${NODEJS_ROOT_FOLDER}/${FILE_PROCESSING_FOLDER}/${generatedVideoId}`;
    const fullMp4Path = `${videoFolder}/${generatedVideoId}.mp4`;

    logger.info(`Downloading Mp4..`);
    await downloadAndSaveFile(mp4Url, fullMp4Path);

    logger.info("Getting Nlp Results..");
    const nlp = await getAudioTranscriptResults(audioTranscriptId);
    fs.writeFile(`${videoFolder}/${generatedVideoId}_NLP.ts`, JSON.stringify(nlp, null, 2), (err) => {});

    logger.info(`Generating Clips..`);
    const processedVideos = await generateClipsAndItsData({
      nlpData: nlp,
      videoFolder,
      originalVideoPath: fullMp4Path,
      videoId: generatedVideoId,
      videoUrl: mp4Url,
    });

    fs.rmdirSync(videoFolder, { recursive: true });

    await axios.post(`${process.env.SERVER_ENDPOINT}/v1/video/status-update`, {
      msg: "success",
      youtubeVideoIdInDb,
      data: processedVideos,
      videoId,
    });
  } catch (error) {
    console.log(error);
    logger.error(`Error while processing video for ${youtubeVideoIdInDb}`);
    await axios.post(`${process.env.SERVER_ENDPOINT}/v1/video/status-update`, {
      msg: "error",
      youtubeVideoIdInDb,
      videoId,
      data: null,
    });
  }
};
