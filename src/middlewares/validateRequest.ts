import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { catchAsync } from "../utils/catchAsync";

/**
 * Validates req.body / req.params / req.query against a Zod schema.
 * On failure, the ZodError propagates to globalErrorHandler which
 * turns it into a structured 400 response.
 *
 * Usage: router.post("/", validateRequest(createPropertyZodSchema), controller.create)
 */
export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body ?? req.body;
    next();
  });
};