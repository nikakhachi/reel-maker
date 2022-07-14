import { Router } from "express";
import { SuccessResponse } from "../../utils/httpResponses";

const router = Router();

router.get("/healthcheck", (req, res) => new SuccessResponse(res));

export default router;
