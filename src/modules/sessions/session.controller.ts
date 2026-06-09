import type { Request, Response } from "express";
import { sendSuccess, sendCreated } from "../../lib/apiResponse.js";
import { parsePagination, buildPaginationMeta } from "../../lib/pagination.js";
import { serializeSession } from "./session.serializer.js";
import * as svc from "./session.service.js";

export const getAllSessions = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
    const status = req.query.status === "active" || req.query.status === "finished" ? req.query.status : undefined;
    const { items, total } = await svc.listSessions({ skip, limit, clientId, status });
    return sendSuccess(res, { data: items.map(serializeSession), meta: buildPaginationMeta(page, limit, total) });
};

export const getOne = async (req: Request<{ id: string }>, res: Response) =>
    sendSuccess(res, { data: serializeSession(await svc.getSessionById(req.params.id)) });

export const start = async (req: Request, res: Response) => {
    const s = await svc.startSession(req.body);
    return sendCreated(res, { data: serializeSession(s), message: "Session started" });
};

export const end = async (req: Request<{ id: string }>, res: Response) => {
    const s = await svc.endSession(req.params.id, req.body);
    return sendSuccess(res, { data: serializeSession(s), message: "Session ended" });
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
    await svc.deleteSession(req.params.id);
    return sendSuccess(res, { message: "Session deleted" });
};