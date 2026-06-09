import type { Request, Response } from "express";
import { sendSuccess, sendCreated } from "../../lib/apiResponse.js";
import { parsePagination, buildPaginationMeta } from "../../lib/pagination.js";
import { serializeSubscription } from "./subscription.serializer.js";
import * as subService from "./subscription.service.js";

export const getAllSubscriptions = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const status = req.query.status === "active" || req.query.status === "expired" ? req.query.status : undefined;
    const { items, total } = await subService.listSubscriptions({ skip, limit, userId, status });
    return sendSuccess(res, {
        data: items.map(serializeSubscription),
        meta: buildPaginationMeta(page, limit, total),
    });
};

export const getOne = async (req: Request<{ id: string }>, res: Response) => {
    const sub = await subService.getSubscriptionById(req.params.id);
    return sendSuccess(res, { data: serializeSubscription(sub) });
};

export const create = async (req: Request, res: Response) => {
    const sub = await subService.createSubscription(req.body);
    return sendCreated(res, { data: serializeSubscription(sub), message: "Subscription created" });
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
    const sub = await subService.updateSubscription(req.params.id, req.body);
    return sendSuccess(res, { data: serializeSubscription(sub), message: "Subscription updated" });
};

export const expire = async (req: Request<{ id: string }>, res: Response) => {
    const sub = await subService.expireSubscription(req.params.id);
    return sendSuccess(res, { data: serializeSubscription(sub), message: "Subscription expired" });
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
    await subService.deleteSubscription(req.params.id);
    return sendSuccess(res, { message: "Subscription deleted" });
};