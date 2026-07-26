import { z } from "zod";

const createReviewZodSchema = z.object({
  body: z.object({
    rentalRequestId: z.string({ required_error: "Rental request is required" }),
    rating: z
      .number({ required_error: "Rating is required" })
      .int()
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    comment: z.string().max(1000).optional(),
  }),
});

export const reviewValidation = {
  createReviewZodSchema,
};