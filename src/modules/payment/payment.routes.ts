import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  auth(Role.TENANT),
  validateRequest(paymentValidation.createPaymentZodSchema),
  paymentController.createPayment
);

export const paymentRoutes = router;