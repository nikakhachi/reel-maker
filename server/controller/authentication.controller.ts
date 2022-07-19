import { Request, Response } from "express";
import { clearCookies, setAccessTokenCookie, setRefreshTokenCookie } from "../services/cookie.service";
import { signAccessToken, signRefreshToken } from "../services/jwt.service";
import logger from "../utils/logger";
import { BadRequestException, ForbiddenException, SuccessResponse } from "../utils/httpResponses";
import * as bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { getUserSubscriptionPlan, stripe } from "../services/stripe.service";
import moment from "moment";
import { FREE_TRIAL_DURAITON_IN_DAYS } from "../constants";

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
