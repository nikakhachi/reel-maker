import { Response } from "express";

const setAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie("accessToken", accessToken, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });
};

export { setAccessTokenCookie, setRefreshTokenCookie };
