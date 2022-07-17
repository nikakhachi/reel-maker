import { Router } from "express";
import {
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

export default router;
