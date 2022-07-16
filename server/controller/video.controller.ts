import { Request, Response } from "express";
import { prisma } from "../prisma";
import { BadRequestException, SuccessResponse } from "../utils/httpResponses";
import logger from "../utils/logger";

export const videoStatusUpdateController = async (req: Request, res: Response) => {
  const { msg, youtubeVideoIdInDb, data, videoIdWithUuid } = req.body;
  if (!msg || !youtubeVideoIdInDb) return new BadRequestException(res);
  if (msg === "error") {
    logger.error(`Error Occured while processing ${youtubeVideoIdInDb}`);
    await prisma.youtubeVideo.update({ where: { id: youtubeVideoIdInDb }, data: { statusId: 3 } });
  }
  if (msg === "success") {
    await prisma.youtubeVideo.update({
      where: { id: youtubeVideoIdInDb },
      data: {
        youtubeVideoId: videoIdWithUuid,
        statusId: 1,
        processedVideos: {
          create: data,
        },
      },
    });
    logger.info(`${youtubeVideoIdInDb} was processed successfully`);
  }
  return new SuccessResponse(res);
};
