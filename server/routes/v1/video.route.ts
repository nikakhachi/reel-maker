import { Router } from "express";
import { videoStatusUpdateController } from "../../controller/video.controller";

const router = Router();

router.post("/status-update", videoStatusUpdateController);

export default router;
