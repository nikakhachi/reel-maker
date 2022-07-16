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
  const existingYoutubeVideoInDb = await prisma.youtubeVideo.findFirst({
    where: { videoId, userId: user.id },
  });
  if (existingYoutubeVideoInDb) return new BadRequestException(res, "Video has been already Generated");
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
  const youtubeVideoInDb = await prisma.youtubeVideo.create({ data: { statusId: 2, userId: user.id, videoId } });

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

export const getVideosController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as User;
  const userVideos = await prisma.youtubeVideo.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      videoId: true,
      status: { select: { name: true } },
      clips: {
        select: {
          createdAt: true,
          gist: true,
          headline: true,
          subtitlesUrl: true,
          summary: true,
          videoUrl: true,
        },
      },
      shorts: {
        select: {
          createdAt: true,
          label: true,
          subtitlesUrl: true,
          text: true,
          videoUrl: true,
        },
      },
    },
  });
  const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;

  const response: any[] = [];

  userVideos.forEach((userVideo) => {
    const status = userVideo.status.name;
    const videoId = userVideo.videoId;
    response.push({
      status,
      videoId,
      clips: userVideo.clips.map((clip) => ({
        ...clip,
        videoUrl: `${cloudfrontUrl}/${clip.videoUrl}`,
        subtitlesUrl: `${cloudfrontUrl}/${clip.subtitlesUrl}`,
      })),
      shorts: userVideo.shorts.map((short) => ({
        ...short,
        videoUrl: `${cloudfrontUrl}/${short.videoUrl}`,
        subtitlesUrl: `${cloudfrontUrl}/${short.subtitlesUrl}`,
      })),
    });
  });

  return new SuccessResponse(res, response);
};
