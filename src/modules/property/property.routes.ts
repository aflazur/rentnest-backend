import { Router } from "express";
import { propertyController } from "./property.controller";

const router = Router();

router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getSingleProperty);

export const propertyRoutes = router;