import { sign } from "jsonwebtoken";

const signAccessToken = async (userId: number) => {
  const accessToken = sign({ id: userId }, process.env.JWT_KEY || "", { expiresIn: "2h" });
  return accessToken;
};

const signRefreshToken = async (userId: number) => {
  const refreshToken = sign({ id: userId }, process.env.JWT_REFRESH_KEY || "", { expiresIn: "1d" });
  return refreshToken;
};

const signResetToken = async (userId: number) => {
  const resetToken = sign({ id: userId }, process.env.JWT_KEY || "", { expiresIn: "10m" });
  return resetToken;
};

export { signAccessToken, signRefreshToken, signResetToken };
