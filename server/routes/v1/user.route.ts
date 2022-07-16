import { Router } from "express";
import { getVideoDataByIdController, getVideosController, startVideoProcessingController } from "../../controller/user.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/videos/:videoId", authenticationGuard, getVideoDataByIdController);
router.get("/videos", authenticationGuard, getVideosController);
router.post("/generate-video", authenticationGuard, startVideoProcessingController);

export default router;
