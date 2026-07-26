import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions["expiresIn"]) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true as const,
      data: verifiedToken as JwtPayload,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error: error.message as string,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};