import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  }
}

/**
 * auth() -> just requires a valid logged-in user (any role)
 * auth(Role.ADMIN, Role.LANDLORD) -> requires the user to have one of the given roles
 */
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : bearer?.startsWith("Bearer ")
      ? bearer.split(" ")[1]
      : bearer;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not logged in. Please log in to access this resource.");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token. Please log in again.");
    }

    const { id, email, name, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to access this resource.");
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User no longer exists. Please log in again.");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }

    req.user = { id, email, name, role };

    next();
  });
};