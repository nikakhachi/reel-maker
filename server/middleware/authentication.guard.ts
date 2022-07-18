import { NextFunction, Request, Response } from "express";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../services/cookie.service";
import { signAccessToken, signRefreshToken } from "../services/jwt.service";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { UnauthorizedException } from "../utils/httpResponses";
import { prisma } from "../prisma";
import { getUserSubscriptionPlan } from "../services/stripe.service";

const authenticationGuard = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Inside Guard");
  const { accessToken, refreshToken } = req.cookies;
  try {
    const payload = jwt.verify(accessToken, process.env.JWT_KEY || "");
    if (typeof payload === "string") return new Error("Internal Server Error");
    const user = await prisma.user.findFirst({ where: { id: payload.id } });
    if (!user) return new UnauthorizedException(res);
    const subscriptionData = await getUserSubscriptionPlan(user.stripeId);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = { ...user, subscription: { ...subscriptionData } };
    logger.debug("Access Token is Valid.");
    next();
  } catch (e) {
    try {
      logger.debug("Access Token is not Valid. Checking Refresh Token");
      const payload = jwt.verify(refreshToken, process.env.JWT_KEY || "accessKey");
      if (typeof payload === "string") return new Error("Internal Server Error");
      const user = await prisma.user.findFirst({ where: { id: payload.id } });
      if (!user) return new UnauthorizedException(res);
      const subscriptionData = await getUserSubscriptionPlan(user.stripeId);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = { ...user, subscription: { ...subscriptionData } };
      logger.debug("Refresh Token is Valid. Assigning new Access and Refresh Tokens");
      const newAccessToken = await signAccessToken(user.id);
      const newRefreshToken = await signRefreshToken(user.id);
      setAccessTokenCookie(res, newAccessToken);
      setRefreshTokenCookie(res, newRefreshToken);
      next();
    } catch (e) {
      logger.debug("Both Tokens Failed Validation");
      return new UnauthorizedException(res);
    }
  }
};

export { authenticationGuard };
