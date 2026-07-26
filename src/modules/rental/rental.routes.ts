import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { rentalValidation } from "./rental.validation";

const router = Router();

router.post(
    "/",
    auth(Role.TENANT),
    validateRequest(rentalValidation.createRentalRequestZodSchema),
    rentalController.createRentalRequest
);

router.get("/", auth(), rentalController.getMyRentalRequests);
router.get("/:id", auth(), rentalController.getSingleRentalRequest);

export const rentalRoutes = router;

// Landlord routes -> mounted at /api/landlord/requests
const landlordRouter = Router();

landlordRouter.get("/", auth(Role.LANDLORD), rentalController.getLandlordRentalRequests);

landlordRouter.patch(
    "/:id",
    auth(Role.LANDLORD),
    validateRequest(rentalValidation.updateRentalRequestStatusZodSchema),
    rentalController.updateRentalRequestStatus
);

export const rentalLandlordRoutes = landlordRouter;