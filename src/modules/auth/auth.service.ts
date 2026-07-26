import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { jwtUtils } from "../../utils/jwt";
import { TLoginPayload, TRegisterPayload } from "./auth.interface";

const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(payload, config.jwt_access_secret, config.jwt_access_expires_in);
  const refreshToken = jwtUtils.createToken(payload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
  return { accessToken, refreshToken };
};

const registerUser = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
    },
  });

  const jwtPayload: JwtPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload: JwtPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  const verified = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verified.success) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token. Please log in again.");
  }

  const { id } = verified.data as JwtPayload;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User no longer exists");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }

  const jwtPayload: JwtPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
  const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);

  return { accessToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};