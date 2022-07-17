import { Request, Response } from "express";
import { prisma } from "../prisma";
import { BadRequestException, SuccessResponse } from "../utils/httpResponses";
import logger from "../utils/logger";

export const videoStatusUpdateController = async (req: Request, res: Response) => {
  const { msg, youtubeVideoIdInDb, data, videoId, videoDuration } = req.body;
  const youtubeVideo = await prisma.youtubeVideo.findFirst({ where: { id: youtubeVideoIdInDb } });
  if (!youtubeVideo) return new BadRequestException(res);
  await prisma.user.update({ where: { id: youtubeVideo.userId }, data: { isProcessing: false } });
  if (!msg || !youtubeVideoIdInDb) return new BadRequestException(res);
  if (msg === "error") {
    logger.error(`Error Occured while processing ${youtubeVideoIdInDb}`);
    await prisma.youtubeVideo.update({ where: { id: youtubeVideoIdInDb }, data: { statusId: 3 } });
  }
  if (msg === "success") {
    await prisma.youtubeVideo.update({
      where: { id: youtubeVideoIdInDb },
      data: { statusId: 1, clips: { create: data.clips }, shorts: { create: data.shorts } },
    });
    await prisma.user.update({
      where: { id: youtubeVideo.userId },
      data: {
        secondsTranscripted: {
          increment: Math.round(videoDuration),
        },
      },
    });
    logger.info(`${youtubeVideoIdInDb} was processed successfully`);
  }
  return new SuccessResponse(res);
};
