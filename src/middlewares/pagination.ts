export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
    const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginationMeta = (page: number, limit: number, total: number) => ({
    pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
    },
});