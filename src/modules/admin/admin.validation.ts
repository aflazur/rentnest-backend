import { z } from "zod";

const updateUserStatusZodSchema = z.object({
  body: z.object({
    activeStatus: z.enum(["ACTIVE", "BLOCKED"], { required_error: "activeStatus is required" }),
  }),
});

export const adminValidation = {
  updateUserStatusZodSchema,
};