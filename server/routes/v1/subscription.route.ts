import { Router } from "express";
import { getAllAvailableSubscriptionsController, upgradeSubscriptionController } from "../../controller/subscription.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/", getAllAvailableSubscriptionsController);
router.post("/upgrade", authenticationGuard, upgradeSubscriptionController);

export default router;
