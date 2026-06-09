import type { Request, Response } from "express";
import { sendSuccess, sendCreated } from "../../lib/apiResponse.js";
import { parsePagination, buildPaginationMeta } from "../../lib/pagination.js";
import { serializeUser } from "./user.serializer.js";
import * as userService from "./user.service.js";

export const getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const { items, total } = await userService.listUsers({ skip, limit, search });
    return sendSuccess(res, {
        data: items.map(serializeUser),
        meta: buildPaginationMeta(page, limit, total),
    });
};

export const getOne = async (req: Request<{ id: string }>, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, { data: serializeUser(user) });
};

export const create = async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    return sendCreated(res, { data: serializeUser(user), message: "User created" });
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, { data: serializeUser(user), message: "User updated" });
};

export const changeStatus = async (req: Request<{ id: string }>, res: Response) => {

    const user = await userService.changeUserStatus(req.params.id);
    return sendSuccess(res, { data: serializeUser(user), message: user.isActive ? "User activated" : "User deactivated" });
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, { message: "User deleted" });
};