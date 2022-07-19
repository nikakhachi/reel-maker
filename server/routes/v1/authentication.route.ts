import { Router } from "express";
import {
  changePasswordController,
  logoutController,
  registerController,
  resetPasswordController,
  signInController,
} from "../../controller/authentication.controller";

const router = Router();

router.post("/login", signInController);
router.post("/register", registerController);
router.post("/logout", logoutController);
router.post("/reset-password", resetPasswordController);
router.post("/change-password", changePasswordController);

export default router;
