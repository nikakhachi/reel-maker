import { Request, Response } from "express";
import { clearCookies, setAccessTokenCookie, setRefreshTokenCookie } from "../services/cookie.service";
import { signAccessToken, signRefreshToken } from "../services/jwt.service";
import logger from "../utils/logger";
import { BadRequestException, SuccessResponse } from "../utils/httpResponses";
import * as bcrypt from "bcrypt";
import { prisma } from "../prisma";

export const signInController = async (req: Request, res: Response) => {
  logger.debug("Sign In User");
  const { username, password } = req.body;
  if (!username || !password) return new BadRequestException(res, "Fields are Missing");
  const user = await prisma.user.findFirst({ where: { username } });
  const isPasswordValid = bcrypt.compareSync(password, user?.password || "");
  if (!user || !isPasswordValid) return new BadRequestException(res, "Invalid Credentials");
  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  new SuccessResponse(res, {
    email: user.email,
    username: user.username,
  });
};

export const registerController = async (req: Request, res: Response) => {
  logger.info("Register Instagram User");
  const { username, email, password } = req.body;
  if (!username || !email || !password) return new BadRequestException(res, "Fields are Missing");
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existingUser) return new BadRequestException(res, "User Already Exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      subscriptionId: 1,
      subscriptionActivationDate: new Date(),
    },
    include: {
      subscription: {
        select: {
          id: true,
          title: true,
          durationInDays: true,
          priceInDollars: true,
          isActive: true,
          transcriptionSeconds: true,
        },
      },
    },
  });
  new SuccessResponse(res, {
    email: createdUser.email,
    username: createdUser.username,
    subscriptionActivationDate: createdUser.subscriptionActivationDate,
    secondsTranscripted: createdUser.secondsTranscripted,
    subscription: createdUser.subscription,
  });
};

export const logoutController = async (req: Request, res: Response) => {
  clearCookies(res);
  new SuccessResponse(res);
};
