import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { createClientSchema, updateClientSchema } from "./client.schema.js";
import { getAllClients, getOne, create, update, changeStatus, remove } from "./client.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllClients);
router.get("/:id", getOne);
router.post("/", validate(createClientSchema), create);
router.put("/:id", validate(updateClientSchema), update);
router.patch("/:id/change-status", changeStatus);
router.delete("/:id", remove);

export default router;