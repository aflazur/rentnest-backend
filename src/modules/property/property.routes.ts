import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import { propertyValidation } from "./property.validation";

// Public property browsing routes -> mounted at /api/properties
const router = Router();

router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getSingleProperty);

export const propertyRoutes = router;

// Landlord property management routes -> mounted at /api/landlord/properties
const landlordRouter = Router();

landlordRouter.get("/", auth(Role.LANDLORD), propertyController.getLandlordProperties);

landlordRouter.post(
  "/",
  auth(Role.LANDLORD),
  validateRequest(propertyValidation.createPropertyZodSchema),
  propertyController.createProperty
);

landlordRouter.put(
  "/:id",
  auth(Role.LANDLORD),
  validateRequest(propertyValidation.updatePropertyZodSchema),
  propertyController.updateProperty
);

landlordRouter.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

export const propertyLandlordRoutes = landlordRouter;