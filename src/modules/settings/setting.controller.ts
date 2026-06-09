import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/apiResponse.js";
import * as svc from "./settings.service.js";

export const getAllSettings = async (_req: Request, res: Response) =>
    sendSuccess(res, { data: await svc.listSettings() });

export const getOne = async (req: Request<{ key: string }>, res: Response) =>
    sendSuccess(res, { data: await svc.getSetting(req.params.key) });

export const update = async (req: Request<{ key: string }>, res: Response) => {
    const { value, description } = req.body as { value: string; description?: string };
    const s = await svc.updateSetting(req.params.key, value, description);
    return sendSuccess(res, { data: s, message: "Setting updated" });
};