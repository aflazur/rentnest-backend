import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import { ApiError } from "../utils/ApiError";

/**
 * Every error response from this API follows the same structured shape:
 * { success: false, message: string, errorDetails: unknown }
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (config.node_env === "development") {
    console.error("Error:", err);
  }

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong. Please try again later.";
  let errorDetails: unknown = err.message || null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ?? null;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "You have provided incorrect field type or missing fields";
    errorDetails = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    if (err.code === "P2002") {
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(", ") || "unknown"}`;
    } else if (err.code === "P2003") {
      message = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      message = "The requested record was not found";
    } else {
      message = "Database request error";
    }
    errorDetails = err.meta ?? err.message;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.SERVICE_UNAVAILABLE;
    message = "Could not connect to the database";
    errorDetails = err.message;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid or expired token. Please log in again.";
    errorDetails = err.message;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};