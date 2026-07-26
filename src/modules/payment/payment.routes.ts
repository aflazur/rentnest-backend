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

// Handles both the Stripe browser redirect (GET) and manual/webhook confirmation (POST)
router.get("/confirm", paymentController.confirmPayment);
router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(), paymentController.getUserPayments);
router.get("/:id", auth(), paymentController.getSinglePayment);

export const paymentRoutes = router;
