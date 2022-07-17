import { NextFunction, Request, Response } from "express";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../services/cookie.service";
import { signAccessToken, signRefreshToken } from "../services/jwt.service";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { UnauthorizedException } from "../utils/httpResponses";
import { prisma } from "../prisma";

const authenticationGuard = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Transcription Guard");
};

export { authenticationGuard };
