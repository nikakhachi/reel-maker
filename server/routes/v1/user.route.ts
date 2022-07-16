import { Router } from "express";
import { getVideoController, getVideosController, startVideoProcessingController } from "../../controller/user.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/videos", authenticationGuard, getVideosController);
router.get("/videos/:videoId", authenticationGuard, getVideoController);
router.post("/generate-video", authenticationGuard, startVideoProcessingController);

export default router;
