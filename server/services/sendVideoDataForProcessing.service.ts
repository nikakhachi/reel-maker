import axios from "axios";
import logger from "../utils/logger";

export const sendVideoDataForProcessing = ({
  videoId,
  mp3Url,
  mp4Url,
  audioTranscriptId,
  youtubeVideoIdInDb,
  videoDuration,
}: {
  videoId: string;
  mp3Url: string;
  mp4Url: string;
  audioTranscriptId: string;
  youtubeVideoIdInDb: number;
  videoDuration: number;
}) => {
  axios
    .post(
      `${process.env.VIDEO_PROCESSOR_ENDPOINT}/v1/process-video`,
      {
        mp3Url,
        mp4Url,
        audioTranscriptId,
        videoId,
        youtubeVideoIdInDb,
        videoDuration,
      },
      { headers: { authorization: process.env.VIDEO_PROCESSOR_ACCESS_KEY || "" } }
    )
    .catch((err) => {
      console.log(err);
      logger.error("Error when sending video for queuing");
    });
};
