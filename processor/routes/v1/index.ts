import { Router } from "express";
import { authenticationGuard } from "../../middleware/authentication.guard";
import { processVideo } from "../../services/processVideo.service";
import { BadRequestException, SuccessResponse } from "../../utils/httpResponses";

const router = Router();

router.get("/healthcheck", (req, res) => new SuccessResponse(res));

router.post("/process-video", authenticationGuard, (req, res) => {
  const { videoId, mp3Url, mp4Url, audioTranscriptId, youtubeVideoIdInDb, videoDuration } = req.body as {
    videoId: string;
    mp3Url: string;
    mp4Url: string;
    audioTranscriptId: string;
    youtubeVideoIdInDb: number;
    videoDuration: number;
  };

  if (!videoId || !mp3Url || !mp4Url || !audioTranscriptId || !youtubeVideoIdInDb) return new BadRequestException(res);

  new SuccessResponse(res, "Processing has Started");

  processVideo({ videoId, mp3Url, mp4Url, audioTranscriptId, youtubeVideoIdInDb, videoDuration });
});

export default router;
