import { Router } from "express";
import { getAllAvailableSubscriptionsController } from "../../controller/subscription.controller";

const router = Router();

router.get("/", getAllAvailableSubscriptionsController);

export default router;
