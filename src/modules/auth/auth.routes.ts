import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { loginSchema } from "./auth.schema.js";
import { login, me, refresh, logout } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);
router.post("/refresh", refresh);
router.post("/logout", logout);
export default router;