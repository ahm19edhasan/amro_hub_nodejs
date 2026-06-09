import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { updateSettingSchema } from "./setting.schema.js";
import { getAllSettings, getOne, update } from "./setting.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllSettings);
router.get("/:key", getOne);
router.put("/:key", validate(updateSettingSchema), update);
export default router;