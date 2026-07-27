import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";


const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  validateRequest(reviewValidation.createReviewZodSchema),
  reviewController.createReview
);

router.get("/property/:propertyId", reviewController.getPropertyReviews);

export const reviewRoutes = router;