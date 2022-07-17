import { Request, Response } from "express";
import { prisma } from "../prisma";
import { SuccessResponse } from "../utils/httpResponses";

export const getAllAvailableSubscriptionsController = async (req: Request, res: Response) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { isActive: true },
    select: {
      durationInDays: true,
      priceInDollars: true,
      title: true,
      transcriptionSeconds: true,
    },
  });
  new SuccessResponse(res, subscriptions);
};
