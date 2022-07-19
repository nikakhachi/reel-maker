import { Router } from "express";
import {
  cancelSubscriptionController,
  changeSubscriptionController,
  getAllAvailableSubscriptionsController,
  makeSubscriptionController,
} from "../../controller/subscription.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/", getAllAvailableSubscriptionsController);
router.post("/subscribe", authenticationGuard, makeSubscriptionController);
router.post("/change", authenticationGuard, changeSubscriptionController);
router.post("/cancel", authenticationGuard, cancelSubscriptionController);

export default router;
