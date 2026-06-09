import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { startSessionSchema, endSessionSchema } from "./session.schema.js";
import { getAllSessions, getOne, start, end, remove } from "./session.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllSessions);
router.get("/:id", getOne);
router.post("/", validate(startSessionSchema), start);
router.patch("/:id/end", validate(endSessionSchema), end);
router.delete("/:id", remove);

export default router;