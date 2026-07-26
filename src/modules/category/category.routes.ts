import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getSingleCategory);

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.createCategoryZodSchema),
  categoryController.createCategory
);

router.put(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.updateCategoryZodSchema),
  categoryController.updateCategory
);

router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;