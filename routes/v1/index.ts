import { Router } from "express";
import { queueAudioForTranscripting } from "../../services/assemblyAI.service";
import { getMp3LinkOfYoutubeVideo } from "../../services/getMp3LinkOfYoutubeVideo";
import { getMP4LinkOfYoutubeVideo } from "../../services/getMp4LinkOfYoutubeVideo";
import { processVideo } from "../../services/processVideo.service";
import { BadRequestException, InternalServerErrorException, SuccessResponse } from "../../utils/httpResponses";
import logger from "../../utils/logger";

const router = Router();

router.get("/healthcheck", (req, res) => new SuccessResponse(res));

router.post("/upload", async (req, res) => {
  const { youtubeVideoUrl } = req.body;
  if (!youtubeVideoUrl) return new BadRequestException(res, "Youtube Video Url is not Provided");
  const videoId = youtubeVideoUrl.split("?v=")[1].split("&")[0];
  let mp3Link: undefined | string;
  let mp4Link: undefined | string;
  let audioTranscriptId: undefined | string;
  try {
    mp4Link = await getMP4LinkOfYoutubeVideo(`${videoId}`);
  } catch (error: any) {
    if (error.status === "fail") {
      logger.error(error.msg);
      return new BadRequestException(res, error.msg);
    } else {
      logger.error(error);
      return new InternalServerErrorException(res);
    }
  }
  try {
    mp3Link = await getMp3LinkOfYoutubeVideo(youtubeVideoUrl);
    if (typeof mp3Link !== "string") return new InternalServerErrorException(res);
  } catch (error) {
    return new BadRequestException(res);
  }
  try {
    audioTranscriptId = await queueAudioForTranscripting(mp3Link);
  } catch (error) {
    console.log(error);
    logger.error("Error Queuing up the Audio for Transcript");
    return new BadRequestException(res);
  }
  new SuccessResponse(res, videoId);
  processVideo(videoId, mp3Link, mp4Link, audioTranscriptId);
});

export default router;
