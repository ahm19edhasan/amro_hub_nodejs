import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { createPlanSchema, updatePlanSchema } from "./plan.schema.js";
import { getAllPlans, getOne, create, update, remove, changeStatus } from "./plan.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllPlans);
router.get("/:id", getOne);
router.post("/", validate(createPlanSchema), create);
router.put("/:id", validate(updatePlanSchema), update);
router.delete("/:id", remove);
router.put("/:id/change-status", changeStatus);

export default router;