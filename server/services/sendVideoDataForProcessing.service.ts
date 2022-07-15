import axios from "axios";
import logger from "../utils/logger";

export const sendVideoDataForProcessing = ({
  videoId,
  mp3Url,
  mp4Url,
  audioTranscriptId,
  youtubeVideoIdInDb,
}: {
  videoId: string;
  mp3Url: string;
  mp4Url: string;
  audioTranscriptId: string;
  youtubeVideoIdInDb: string;
}) => {
  axios
    .post(
      `http://localhost:8080/api/v1/process-video`,
      {
        mp3Url,
        mp4Url,
        audioTranscriptId,
        videoId,
        youtubeVideoIdInDb,
      },
      { headers: { authorization: "admin" } }
    )
    .catch((err) => {
      console.log(err);
      logger.error("Error when sending video for queuing");
    });
};
