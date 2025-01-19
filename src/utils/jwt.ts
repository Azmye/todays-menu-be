import { sign, verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

const secretKey = process.env.JWT_SECRET!;

export const generateToken = async (payload: JWTPayload) => {
  const token = await sign(payload, secretKey);

  return token;
};

export const verifyToken = async (token: string) => {
  const isValid = await verify(token, secretKey);

  return isValid;
};
