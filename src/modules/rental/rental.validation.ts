import { z } from "zod";

const createRentalRequestZodSchema = z.object({
    body: z.object({
        propertyId: z.string({ required_error: "Property is required" }),
        moveInDate: z.coerce.date({ required_error: "Move-in date is required" }),
        message: z.string().optional(),
    }),
});

const updateRentalRequestStatusZodSchema = z.object({
    body: z
        .object({
            status: z.enum(["APPROVED", "REJECTED"], { required_error: "Status is required" }),
            rejectReason: z.string().optional(),
        })
        .refine((data) => data.status !== "REJECTED" || !!data.rejectReason, {
            message: "rejectReason is required when rejecting a request",
            path: ["rejectReason"],
        }),
});

export const rentalValidation = {
    createRentalRequestZodSchema,
    updateRentalRequestStatusZodSchema,
};