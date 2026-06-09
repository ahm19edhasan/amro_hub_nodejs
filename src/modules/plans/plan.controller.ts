import type { Request, Response } from "express";
import { sendSuccess, sendCreated } from "../../lib/apiResponse.js";
import { serializePlan } from "./plan.serializer.js";
import * as planService from "./plan.service.js";
import { parsePagination, buildPaginationMeta } from "../../lib/pagination.js";

/**
 * ? Get All Plans
 * @param req
 * @param res
 */
export const getAllPlans = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const { items, total } = await planService.getAllPlans({ skip, limit, search });

    return sendSuccess(res, {
        data: items.map(serializePlan),
        meta: buildPaginationMeta(page, limit, total),
    });
};

/**
 * ? Get Specific Plan By ID
 * @param req
 * @param res
 */
export const getOne = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const plan = await planService.getPlanById(id);
    return sendSuccess(res, { data: serializePlan(plan) });
};

/**
 * ? Create New Plan
 * @param req
 * @param res
 */
export const create = async (req: Request, res: Response) => {
    const plan = await planService.createPlan(req.body);
    return sendCreated(res, { data: serializePlan(plan), message: "Plan created" });
};

/**
 * ? Update Specific Plan By ID
 * @param req
 * @param res
 */
export const update = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const plan = await planService.updatePlan(id, req.body);
    return sendSuccess(res, { data: serializePlan(plan), message: "Plan updated" });
};

/**
 * ? Remove Specific Plan By ID
 * @param req
 * @param res
 */
export const remove = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await planService.deletePlan(id);
    return sendSuccess(res, { message: "Plan deleted" });
};

/**
 * ? Change Status For Specific Plan By ID
 * @param req
 * @param res
 */
export const changeStatus = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const plan = await planService.changePlanStatus(id);
    return sendSuccess(res, {
        data: serializePlan(plan),
        message: plan.isActive ? "Plan activated" : "Plan deactivated",
    });
};