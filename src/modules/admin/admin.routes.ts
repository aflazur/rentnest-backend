import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

router.use(auth(Role.ADMIN));

router.get("/dashboard", adminController.getDashboardSummary);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", validateRequest(adminValidation.updateUserStatusZodSchema), adminController.updateUserStatus);

router.get("/properties", adminController.getAllProperties);
router.get("/rentals", adminController.getAllRentalRequests);

export const adminRoutes = router;