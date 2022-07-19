import { Request, Response } from "express";
import { clearCookies, setAccessTokenCookie, setRefreshTokenCookie } from "../services/cookie.service";
import { signAccessToken, signRefreshToken, signResetToken } from "../services/jwt.service";
import logger from "../utils/logger";
import { BadRequestException, ForbiddenException, InternalServerErrorException, SuccessResponse } from "../utils/httpResponses";
import * as bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { getUserSubscriptionPlan, stripe } from "../services/stripe.service";
import moment from "moment";
import { FREE_TRIAL_DURAITON_IN_DAYS } from "../constants";
import { sendEmail } from "../utils/nodeMailer";
import * as jwt from "jsonwebtoken";

export const signInController = async (req: Request, res: Response) => {
  logger.debug("Sign In User");
  const { username, password } = req.body;
  if (!username || !password) return new BadRequestException(res, "Fields are Missing");
  const user = await prisma.user.findFirst({ where: { username } });
  const isPasswordValid = bcrypt.compareSync(password, user?.password || "");
  if (!user || !isPasswordValid) return new BadRequestException(res, "Invalid Credentials");
  const subscriptionData = await getUserSubscriptionPlan(user.stripeId);
  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  new SuccessResponse(res, {
    email: user.email,
    secondsTranscripted: user.secondsTranscripted,
    username: user.username,
    subscriptionData,
    freeTrialEndDate: !subscriptionData ? moment(user.createdAt).add(FREE_TRIAL_DURAITON_IN_DAYS, "days") : undefined,
  });
};

export const registerController = async (req: Request, res: Response) => {
  logger.info("Register Instagram User");
  const { username, email, password } = req.body;
  if (process.env.NODE_ENV === "testing" && !/@nathaston.com$/.test(email)) return new ForbiddenException(res);
  if (!username || !email || !password) return new BadRequestException(res, "Fields are Missing");
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existingUser) return new BadRequestException(res, "User Already Exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const stripeAccount = await stripe.customers.create({
    email,
    name: username,
  });
  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      stripeId: stripeAccount.id,
    },
  });
  new SuccessResponse(res, {
    email: createdUser.email,
    username: createdUser.username,
    secondsTranscripted: createdUser.secondsTranscripted,
    subscriptionData: null,
    freeTrialEndDate: moment(createdUser.createdAt).add(FREE_TRIAL_DURAITON_IN_DAYS, "days"),
  });
};

export const logoutController = async (req: Request, res: Response) => {
  clearCookies(res);
  new SuccessResponse(res);
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({ where: { email }, select: { email: true, id: true } });
  if (user) {
    const resetToken = await signResetToken(user.id);
    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: `<p>Go to following link to reset your password. Token will be active for 10 minutes only !<p><br></br><p>${process.env.CLIENT_URL}/reset-password/${resetToken}</p>`,
    });
  }
  return new SuccessResponse(res, `Password reset link is sent to the provided email.`);
};

export const changePasswordController = async (req: Request, res: Response) => {
  const { password, resetToken } = req.body;
  const payload = jwt.decode(resetToken);
  if (typeof payload === "string" || !payload) return new BadRequestException(res);
  const user = await prisma.user.findFirst({ where: { id: payload.id } });
  if (!user) return new InternalServerErrorException(res, "Internal Server Error");
  const hashedPassword = await bcrypt.hash(password, 10);
  clearCookies(res);
  const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  new SuccessResponse(res);
};
