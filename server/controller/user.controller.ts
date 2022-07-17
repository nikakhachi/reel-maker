import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { queueAudioForTranscripting } from "../services/assemblyAI.service";
import { getMp3LinkOfYoutubeVideo } from "../services/getMp3LinkOfYoutubeVideo";
import { getMP4LinkOfYoutubeVideo } from "../services/getMp4LinkOfYoutubeVideo";
import { sendVideoDataForProcessing } from "../services/sendVideoDataForProcessing.service";
import { BadRequestException, InternalServerErrorException, NotFoundException, SuccessResponse } from "../utils/httpResponses";
import logger from "../utils/logger";
import * as bcrypt from "bcrypt";
import { clearCookies } from "../services/cookie.service";
import { downloadS3FolderAsZip } from "../aws";

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
  const user = req.user as User;
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
  const user = req.user as User;
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
  const user = req.user as User;
  const { videoId } = req.params;
  const youtubeVideo = await prisma.youtubeVideo.findFirst({ where: { userId: user.id, videoId } });
  if (!youtubeVideo) return new BadRequestException(res);
  downloadS3FolderAsZip(res, `${videoId}/`);
};
