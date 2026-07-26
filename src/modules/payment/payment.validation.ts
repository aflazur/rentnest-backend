import { z } from "zod";

const createPaymentZodSchema = z.object({
  body: z.object({
    rentalRequestId: z.string({ required_error: "Rental request is required" }),
  }),
});

const confirmPaymentZodSchema = z.object({
  body: z.object({
    transactionId: z.string({ required_error: "Transaction ID is required" }),
  }),
});

export const paymentValidation = {
  createPaymentZodSchema,
  confirmPaymentZodSchema,
};
