import { sign } from "jsonwebtoken";

const signAccessToken = async (userId: number) => {
  const accessToken = sign({ id: userId }, process.env.JWT_KEY || "", { expiresIn: "2h" });
  return accessToken;
};

const signRefreshToken = async (userId: number) => {
  const refreshToken = sign({ id: userId }, process.env.JWT_REFRESH_KEY || "", { expiresIn: "1d" });
  return refreshToken;
};

export { signAccessToken, signRefreshToken };
