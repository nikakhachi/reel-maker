import { Router } from "express";
import {
  cancelSubscriptionController,
  getAllAvailableSubscriptionsController,
  upgradeSubscriptionController,
} from "../../controller/subscription.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/", getAllAvailableSubscriptionsController);
router.post("/upgrade", authenticationGuard, upgradeSubscriptionController);
router.post("/cancel", authenticationGuard, cancelSubscriptionController);

export default router;
