import { Request, Response } from "express";
import { prisma } from "../prisma";
import { cancelSubscription, getAllSubscriptionPlans, getUserSubscriptionPlan, subscribeToPlan } from "../services/stripe.service";
import { BadRequestException, SuccessResponse } from "../utils/httpResponses";

export const getAllAvailableSubscriptionsController = async (req: Request, res: Response) => {
  const subscriptionPlans = await getAllSubscriptionPlans();
  new SuccessResponse(res, subscriptionPlans);
};

export const upgradeSubscriptionController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const { priceId } = req.body;
  const stripeResponse = await subscribeToPlan(user.stripeId, priceId);
  new SuccessResponse(res, stripeResponse);
};

export const cancelSubscriptionController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const userSubscriptionPlan = await getUserSubscriptionPlan(user.stripeId);
  if (!userSubscriptionPlan) return new BadRequestException(res, "User has no subscription");
  await cancelSubscription(userSubscriptionPlan.subscriptionId);
  await prisma.user.update({ where: { id: user.id }, data: { secondsTranscripted: 0 } });
  return new SuccessResponse(res);
};
