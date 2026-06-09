import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import planRoutes from "../modules/plans/plan.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import subscriptionRoutes from "../modules/subscriptions/subscription.routes.js";
import clientRoutes from "../modules/clients/client.routes.js";
import settingsRoutes from "../modules/settings/setting.routes.js";
import sessionRoutes from "../modules/sessions/session.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/plans", planRoutes);
router.use("/users", userRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/clients", clientRoutes);
router.use("/settings", settingsRoutes);
router.use("/sessions", sessionRoutes);

export default router;