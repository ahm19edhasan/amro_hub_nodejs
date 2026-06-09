import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { createUserSchema, updateUserSchema, changeStatusSchema } from "./user.schema.js";
import { getAllUsers, getOne, create, update, changeStatus, remove } from "./user.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllUsers);
router.get("/:id", getOne);
router.post("/",  validate(createUserSchema), create);
router.put("/:id", validate(updateUserSchema), update);
router.delete("/:id", remove);
router.patch("/:id/change-status", changeStatus);

export default router;