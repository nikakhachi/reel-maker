import { Router } from "express";
import { registerController, signInController, validateUserController } from "../../controller/authentication.controller";
import { authenticationGuard } from "../../middleware/authentication.guard";

const router = Router();

router.get("/validate", authenticationGuard, validateUserController);
router.post("/login", signInController);
router.post("/register", registerController);

export default router;
