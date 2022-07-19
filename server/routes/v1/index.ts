import { Router } from "express";
import AuthRoutes from "./authentication.route";
import UserRoutes from "./user.route";
import VideoRoutes from "./video.route";
import SubscriptionRoutes from "./subscription.route";
import StripeRoutes from "./stripe.router";
import { SuccessResponse } from "../../utils/httpResponses";

const router = Router();

router.get("/healthcheck", (req, res) => new SuccessResponse(res));

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/video", VideoRoutes);
router.use("/subscription", SubscriptionRoutes);
router.use("/stripe", StripeRoutes);

export default router;
