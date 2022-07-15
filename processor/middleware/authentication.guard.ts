import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/httpResponses";

const authenticationGuard = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (authorization === process.env.ACCESS_KEY) {
    next();
  } else {
    new UnauthorizedException(res);
  }
};

export { authenticationGuard };
