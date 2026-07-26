import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { propertyLandlordRoutes, propertyRoutes } from "../modules/property/property.routes";
import { rentalLandlordRoutes, rentalRoutes } from "../modules/rental/rental.routes";
import { reviewRoutes } from "../modules/review/review.routes";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/properties", route: propertyRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/landlord/properties", route: propertyLandlordRoutes },
  { path: "/landlord/requests", route: rentalLandlordRoutes },
  { path: "/rentals", route: rentalRoutes },
  { path: "/payments", route: paymentRoutes },
  { path: "/reviews", route: reviewRoutes },
  { path: "/admin", route: adminRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const apiRouter = router;
