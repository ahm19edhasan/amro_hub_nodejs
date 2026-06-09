import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { createSubscriptionSchema, updateSubscriptionSchema } from "./subscription.schema.js";
import { getAllSubscriptions, getOne, create, update, expire, remove } from "./subscription.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllSubscriptions);
router.get("/:id", getOne);
router.post("/", validate(createSubscriptionSchema), create);
router.put("/:id", validate(updateSubscriptionSchema), update);
router.patch("/:id/expire", expire);
router.delete("/:id", remove);

export default router;