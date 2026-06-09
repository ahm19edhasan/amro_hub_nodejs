import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { cacheGet, cacheSet, cacheInvalidate } from "../../lib/settingsCache.js";

export const listSettings = () => prisma.settings.findMany({ orderBy: { key: "asc" } });

export const getSetting = async (key: string) => {
    const s = await prisma.settings.findUnique({ where: { key } });
    if (!s) throw AppError.notFound(`Setting '${key}' not found`, "RESOURCE_NOT_FOUND");
    return s;
};

export const updateSetting = async (key: string, value: string, description?: string) => {
    const s = await prisma.settings.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description: description ?? "", group: "general" },
    });
    cacheInvalidate(key);
    return s;
};

export const getSettingNumber = async (key: string, fallback: number): Promise<number> => {
    const cached = cacheGet(key);
    if (cached !== null) {
        const n = Number(cached);
        return Number.isFinite(n) ? n : fallback;
    }
    const s = await prisma.settings.findUnique({ where: { key } });
    if (!s) return fallback;
    cacheSet(key, s.value);
    const n = Number(s.value);
    return Number.isFinite(n) ? n : fallback;
};