const TTL_MS = 5 * 60_000; // 5 minutes safety net

interface Entry { value: string; expiresAt: number; }
const store = new Map<string, Entry>();

export const cacheGet = (key: string): string | null => {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
        store.delete(key);
        return null;
    }
    return hit.value;
};

export const cacheSet = (key: string, value: string, ttlMs = TTL_MS): void => {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const cacheInvalidate = (key?: string): void => {
    if (key) store.delete(key);
    else store.clear();
};