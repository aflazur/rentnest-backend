import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";


const router = Router();

router.post("/register", validateRequest(authValidation.registerZodSchema), authController.register);
router.post("/login", validateRequest(authValidation.loginZodSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", auth(), authController.getMe);

export const authRoutes = router;