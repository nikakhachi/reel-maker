import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { queueAudioForTranscripting } from "../services/assemblyAI.service";
import { getMp3LinkOfYoutubeVideo } from "../services/getMp3LinkOfYoutubeVideo";
import { getMP4LinkOfYoutubeVideo } from "../services/getMp4LinkOfYoutubeVideo";
import { sendVideoDataForProcessing } from "../services/sendVideoDataForProcessing.service";
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
} from "../utils/httpResponses";
import logger from "../utils/logger";
import * as bcrypt from "bcrypt";
import { clearCookies } from "../services/cookie.service";
import { downloadS3FolderAsZip } from "../aws";
import { RequestUserType } from "../types";
import { getVideoDurationInSeconds } from "get-video-duration";
import { getUserSubscriptionPlan } from "../services/stripe.service";
import { TRANSRIPTION_SECONDS_FOR_FREE_PLAN } from "../constants";

export const validateUserController = async (req: Request, res: Response) => {
  logger.debug("Send Credentials For User Validation");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const subscriptionData = await getUserSubscriptionPlan(user.stripeId);
  new SuccessResponse(res, {
    email: user.email,
    username: user.username,
    secondsTranscripted: user.secondsTranscripted,
    subscriptionData,
  });
};

export const startVideoProcessingController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const isUserProcessingVideo = await prisma.user.findFirst({ where: { id: user.id }, select: { isProcessing: true } });
  if (!isUserProcessingVideo) return new InternalServerErrorException(res);
  if (isUserProcessingVideo.isProcessing) {
    return new BadRequestException(res, "Other video is already being processed");
  }
  const { youtubeVideoUrl } = req.body;
  if (!youtubeVideoUrl) return new BadRequestException(res, "Youtube Video Url is not Provided");
  const videoId = youtubeVideoUrl.split("?v=")[1]?.split("&")[0];
  if (!videoId) return new BadRequestException(res, "Invalid Url");
  const sendError = async (callback: () => void) => {
    await prisma.user.update({ where: { id: user.id }, data: { isProcessing: false } });
    callback();
  };
  await prisma.user.update({ where: { id: user.id }, data: { isProcessing: true } });
  const existingYoutubeVideoInDb = await prisma.youtubeVideo.findFirst({
    where: { videoId, userId: user.id },
  });
  if (existingYoutubeVideoInDb) return sendError(() => new BadRequestException(res, "Video has been already Generated"));
  let mp3Link: undefined | string;
  let mp4Link: undefined | string;
  let audioTranscriptId: undefined | string;
  let videoDuration: undefined | number;
  try {
    mp4Link = await getMP4LinkOfYoutubeVideo(`${videoId}`);
    videoDuration = await getVideoDurationInSeconds(mp4Link);
    const userSubscriptionData = await getUserSubscriptionPlan(user.stripeId);
    const transcriptSecondsLeft =
      (userSubscriptionData?.transcriptionSeconds || TRANSRIPTION_SECONDS_FOR_FREE_PLAN) - user.secondsTranscripted;
    if (transcriptSecondsLeft < Math.round(videoDuration))
      return sendError(
        () =>
          new ForbiddenException(res, `Can not process this video. You have only ${transcriptSecondsLeft} transcription seconds available.`)
      );
  } catch (error: any) {
    if (error.status === "fail") {
      logger.error(error.msg);
      return sendError(() => new BadRequestException(res, error.msg));
    } else {
      logger.error(error);
      return sendError(() => new InternalServerErrorException(res));
    }
  }
  try {
    mp3Link = await getMp3LinkOfYoutubeVideo(youtubeVideoUrl);
    if (typeof mp3Link !== "string") return sendError(() => new InternalServerErrorException(res));
  } catch (error) {
    console.log(error);
    return sendError(() => new BadRequestException(res));
  }
  try {
    audioTranscriptId = await queueAudioForTranscripting(mp3Link);
  } catch (error) {
    console.log(error);
    logger.error("Error Queuing up the Audio for Transcript");
    return sendError(() => new BadRequestException(res));
  }
  const youtubeVideoInDb = await prisma.youtubeVideo.create({ data: { statusId: 2, userId: user.id, videoId } });

  logger.info(`Sending video data for processing`);
  sendVideoDataForProcessing({
    mp3Url: mp3Link,
    mp4Url: mp4Link,
    audioTranscriptId,
    videoId,
    youtubeVideoIdInDb: youtubeVideoInDb.id,
    videoDuration,
  });

  new SuccessResponse(res, {
    videoId,
    uuid: youtubeVideoInDb.id,
  });
};

export const getVideosController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const userVideos = await prisma.youtubeVideo.findMany({
    where: { userId: user.id },
    select: {
      videoId: true,
      status: { select: { name: true } },
      _count: {
        select: {
          clips: true,
          shorts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return new SuccessResponse(res, userVideos);
};

export const getVideoController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const { videoId } = req.params;
  if (typeof videoId !== "string") return new BadRequestException(res);
  const youtubeVideo = await prisma.youtubeVideo.findFirst({
    where: { userId: user.id, videoId, statusId: 1 },
    select: {
      clips: {
        select: {
          gist: true,
          headline: true,
          createdAt: true,
          subtitlesUrl: true,
          summary: true,
          videoUrl: true,
        },
        orderBy: {
          createdAt: "desc",
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  if (!youtubeVideo) return new BadRequestException(res);

  return new SuccessResponse(res, youtubeVideo);
};

export const updateAccountInfoController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const { username, email, currentPassword, newPassword } = req.body;
  if (!username || !email || !currentPassword) return new BadRequestException(res, "Fields are Missing");
  const isPasswordValid = bcrypt.compareSync(currentPassword, user?.password || "");
  if (!isPasswordValid) return new BadRequestException(res, "Password is Incorrect");
  const updatedUserData: { username: string; email: string; password: undefined | string } = { username, email, password: undefined };
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updatedUserData.password = hashedPassword;
    clearCookies(res);
  }
  const updatedUser = await prisma.user.update({ where: { id: user.id }, data: updatedUserData, select: { email: true, username: true } });
  new SuccessResponse(res, updatedUser);
};

export const downloadZippedVideosController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const { videoId } = req.params;
  const youtubeVideo = await prisma.youtubeVideo.findFirst({ where: { userId: user.id, videoId } });
  if (!youtubeVideo) return new BadRequestException(res);
  downloadS3FolderAsZip(res, `${videoId}/`);
};
