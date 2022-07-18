import { Request, Response } from "express";
import { getAllSubscriptionPlans, stripe } from "../services/stripe.service";
import { SuccessResponse } from "../utils/httpResponses";

export const getAllAvailableSubscriptionsController = async (req: Request, res: Response) => {
  const subscriptionPlans = await getAllSubscriptionPlans();
  new SuccessResponse(res, subscriptionPlans);
};

export const upgradeSubscriptionController = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user as RequestUserType;
  const { priceId } = req.body;
  const stripeResponse = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: user.stripeId,
    subscription_data: { items: [{ plan: priceId }] },
    success_url: "http://localhost:3000/dashboard/my-account",
    cancel_url: "http://localhost:3000/dashboard/my-account",
  });
  new SuccessResponse(res, stripeResponse);
};
