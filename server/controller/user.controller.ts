import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { queueAudioForTranscripting } from "../services/assemblyAI.service";
import { getMp3LinkOfYoutubeVideo } from "../services/getMp3LinkOfYoutubeVideo";
import { getMP4LinkOfYoutubeVideo } from "../services/getMp4LinkOfYoutubeVideo";
import { sendVideoDataForProcessing } from "../services/sendVideoDataForProcessing.service";
import { BadRequestException, InternalServerErrorException, NotFoundException, SuccessResponse } from "../utils/httpResponses";
import logger from "../utils/logger";

export const startVideoProcessingController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as User;
  const { youtubeVideoUrl } = req.body;
  if (!youtubeVideoUrl) return new BadRequestException(res, "Youtube Video Url is not Provided");
  const videoId = youtubeVideoUrl.split("?v=")[1]?.split("&")[0];
  if (!videoId) return new BadRequestException(res, "Invalid Url");
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
  const youtubeVideoInDb = await prisma.youtubeVideo.create({ data: { statusId: 2, userId: user.id } });

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
};

export const getVideoDataByIdController = async (req: Request, res: Response) => {
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
};

export const getVideosController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as User;
  const userVideos = await prisma.youtubeVideo.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      youtubeVideoId: true,
      status: { select: { name: true } },
      processedVideos: {
        select: {
          metadataUrl: true,
          subtitlesUrl: true,
          videoUrl: true,
          videoType: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;

  const response: {
    status: string;
    youtubeVideoId: string;
    videos: {
      type: string;
      videoUrl: string;
      metadataUrl: string;
      subtitlesUrl: string;
    }[];
  }[] = [];

  userVideos.forEach((userVideo) => {
    const status = userVideo.status.name;
    const youtubeVideoId = userVideo.youtubeVideoId || "";
    const videos = userVideo.processedVideos.map((item) => ({
      type: item.videoType.name,
      videoUrl: `${cloudfrontUrl}/${item.videoUrl}`,
      metadataUrl: `${cloudfrontUrl}/${item.metadataUrl}`,
      subtitlesUrl: `${cloudfrontUrl}/${item.subtitlesUrl}`,
    }));
    response.push({
      status,
      youtubeVideoId,
      videos,
    });
  });

  return new SuccessResponse(res, response);
};
