import type { Request, Response } from "express";
import { sendSuccess, sendCreated } from "../../lib/apiResponse.js";
import { parsePagination, buildPaginationMeta } from "../../lib/pagination.js";
import { serializeClient } from "./client.serializer.js";
import * as clientService from "./client.service.js";

export const getAllClients = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const { items, total } = await clientService.listClients({ skip, limit, search });
    return sendSuccess(res, {
        data: items.map(serializeClient),
        meta: buildPaginationMeta(page, limit, total),
    });
};

export const getOne = async (req: Request<{ id: string }>, res: Response) => {
    const client = await clientService.getClientById(req.params.id);
    return sendSuccess(res, { data: serializeClient(client) });
};

export const create = async (req: Request, res: Response) => {
    const client = await clientService.createClient(req.body);
    return sendCreated(res, { data: serializeClient(client), message: "Client created" });
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
    const client = await clientService.updateClient(req.params.id, req.body);
    return sendSuccess(res, { data: serializeClient(client), message: "Client updated" });
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
    await clientService.deleteClient(req.params.id);
    return sendSuccess(res, { message: "Client deleted" });
};

export const changeStatus = async (req: Request<{ id: string }>, res: Response) => {
    const client = await clientService.changeClientStatus(req.params.id);
    return sendSuccess(res, { data: serializeClient(client), message: client.isActive ? "Client activated" : "Client deactivated" });
};