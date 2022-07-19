import { Router, raw } from "express";
import { BadRequestException, SuccessResponse } from "../../utils/httpResponses";
import logger from "../../utils/logger";
import { stripe } from "../../services/stripe.service";
import { prisma } from "../../prisma";

const router = Router();

router.post("/webhook", raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // @ts-ignore
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return new BadRequestException(res, `Webhook Error: ${err.message}`);
  }

  if (event.type === "invoice.payment_succeeded") {
    logger.info(`Handle ${event.type}`);
    // @ts-ignore
    const user = await prisma.user.findFirst({ where: { stripeId: event.data.object.customer } });
    if (!user) return logger.error(`Error in ${event.type} WebHook. Cant find user with provided customerId in DB.`);
    await prisma.user.update({ where: { id: user.id }, data: { secondsTranscripted: 0 } });
  } else if (event.type === "customer.subscription.deleted") {
    logger.info(`Handle ${event.type}`);
    // @ts-ignore
    const user = await prisma.user.findFirst({ where: { stripeId: event.data.object.customer } });
    if (!user) return logger.error(`Error in ${event.type} WebHook. Cant find user with provided customerId in DB.`);
    await prisma.user.update({ where: { id: user.id }, data: { secondsTranscripted: 0 } });
  } else {
    logger.debug(`Unhandled event type ${event.type}`);
  }

  new SuccessResponse(res, "OK", 200, false);
});

export default router;
