import { Router } from "express";
import {
  downloadZippedVideosController,
  getVideoController,
  getVideosController,
  startVideoProcessingController,
  updateAccountInfoController,
} from "../../controller/user.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/videos", authenticationGuard, getVideosController);
router.get("/videos/:videoId", authenticationGuard, getVideoController);
router.post("/generate-video", authenticationGuard, startVideoProcessingController);
router.post("/update-account", authenticationGuard, updateAccountInfoController);
router.get("/videos/download/:videoId", authenticationGuard, downloadZippedVideosController);

export default router;
