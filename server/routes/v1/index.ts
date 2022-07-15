import axios from "axios";
import { Router } from "express";
import { prisma } from "../../prisma";
import { queueAudioForTranscripting } from "../../services/assemblyAI.service";
import { getMp3LinkOfYoutubeVideo } from "../../services/getMp3LinkOfYoutubeVideo";
import { getMP4LinkOfYoutubeVideo } from "../../services/getMp4LinkOfYoutubeVideo";
import { sendVideoDataForProcessing } from "../../services/sendVideoDataForProcessing.service";
import { BadRequestException, InternalServerErrorException, NotFoundException, SuccessResponse } from "../../utils/httpResponses";
import logger from "../../utils/logger";

const router = Router();

router.get("/healthcheck", (req, res) => new SuccessResponse(res));

router.post("/video-status", async (req, res) => {
  const { msg, youtubeVideoIdInDb, data } = req.body;
  if (!msg || !youtubeVideoIdInDb) return new BadRequestException(res);
  if (msg === "error") {
    logger.error(`Error Occured while processing ${youtubeVideoIdInDb}`);
    await prisma.youtubeVideo.update({ where: { id: youtubeVideoIdInDb }, data: { statusId: 3 } });
  }
  if (msg === "success") {
    await prisma.youtubeVideo.update({
      where: { id: youtubeVideoIdInDb },
      data: {
        statusId: 1,
        processedVideos: {
          create: data,
        },
      },
    });
    logger.info(`${youtubeVideoIdInDb} was processed successfully`);
  }
  return new SuccessResponse(res);
});

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
    console.log(error);
    return new BadRequestException(res);
  }
  try {
    audioTranscriptId = await queueAudioForTranscripting(mp3Link);
  } catch (error) {
    console.log(error);
    logger.error("Error Queuing up the Audio for Transcript");
    return new BadRequestException(res);
  }
  const youtubeVideoInDb = await prisma.youtubeVideo.create({ data: { statusId: 2 } });

  logger.info(`Sending video data for processing`);
  sendVideoDataForProcessing({
    mp3Url: mp3Link,
    mp4Url: mp4Link,
    audioTranscriptId,
    videoId,
    youtubeVideoIdInDb: youtubeVideoInDb.id,
  });

  new SuccessResponse(res, {
    videoId,
    uuid: youtubeVideoInDb.id,
  });
});

router.get("/:youtubeVideoId", async (req, res) => {
  const { youtubeVideoId } = req.params;
  const youtubeVideo = await prisma.youtubeVideo.findFirst({
    where: { id: youtubeVideoId },
    include: {
      processedVideos: {
        select: {
          metadataUrl: true,
          subtitlesUrl: true,
          videoUrl: true,
          videoType: {
            select: { name: true },
          },
        },
      },
    },
  });
  if (!youtubeVideo) return new NotFoundException(res);
  if (youtubeVideo.statusId === 2) return new SuccessResponse(res, "Processing");
  if (youtubeVideo.statusId === 3) return new SuccessResponse(res, "Error while Processing");
  const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
  return new SuccessResponse(
    res,
    youtubeVideo.processedVideos.map((item) => ({
      ...item,
      metadataUrl: `${cloudfrontUrl}/${item.metadataUrl}`,
      subtitlesUrl: `${cloudfrontUrl}/${item.subtitlesUrl}`,
      videoUrl: `${cloudfrontUrl}/${item.videoUrl}`,
    }))
  );
});

export default router;
