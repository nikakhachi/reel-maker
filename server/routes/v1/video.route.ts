import { Router } from "express";
import { videoStatusUpdateController } from "../../controller/video.controller";

const router = Router();

router.get("/video-status-update", videoStatusUpdateController);

export default router;
