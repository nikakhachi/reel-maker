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
  youtubeVideoIdInDb: string;
}

export const processVideo = async ({ videoId, mp3Url, mp4Url, audioTranscriptId, youtubeVideoIdInDb }: IArguments) => {
  try {
    const generatedVideoId = `${videoId}_${v4()}`;

    fs.mkdirSync(path.resolve(path.join(NODEJS_ROOT_FOLDER, FILE_PROCESSING_FOLDER, generatedVideoId)));

    const videoFolder = `${NODEJS_ROOT_FOLDER}/${FILE_PROCESSING_FOLDER}/${generatedVideoId}`;
    const fullMp4Path = `${videoFolder}/${generatedVideoId}.mp4`;
    const fullMp3Path = `${videoFolder}/${generatedVideoId}.mp3`;

    logger.info(`Downloading Mp3 and Mp4..`);
    await Promise.all([downloadAndSaveFile(mp4Url, fullMp4Path), downloadAndSaveFile(mp3Url, fullMp3Path)]);

    logger.info("Getting Nlp Results..");
    const nlp = await getAudioTranscriptResults(audioTranscriptId);
    fs.writeFile(`${videoFolder}/${generatedVideoId}_NLP.ts`, JSON.stringify(nlp, null, 2), (err) => {});

    logger.info(`Generating Clips..`);
    const processedVideos = await generateClipsAndItsData(nlp, videoFolder, fullMp4Path, generatedVideoId);

    fs.rmdirSync(videoFolder, { recursive: true });

    await axios.post("http://localhost:5000/api/v1/video-status", {
      msg: "success",
      youtubeVideoIdInDb,
      data: processedVideos,
    });
  } catch (error) {
    console.log(error);
    logger.error(`Error while processing video for ${youtubeVideoIdInDb}`);
    await axios.post("http://localhost:5000/api/v1/video-status", {
      msg: "error",
      youtubeVideoIdInDb,
      data: null,
    });
  }
};
