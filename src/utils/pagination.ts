import type { PaginatedResponse } from "../types";

/**
 * Create pagination metadata
 */
export const createPagination = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};

/**
 * Parse pagination query parameters
 */
export const parsePaginationQuery = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 10, 100); // Max 100 items per page

  return { page, limit };
};

/**
 * Apply pagination to an array
 */
export const applyPagination = <T>(
  items: T[],
  page: number,
  limit: number
): { paginatedItems: T[]; pagination: any } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const pagination = createPagination(page, limit, items.length);

  return { paginatedItems, pagination };
};

/**
 * Create a standardized paginated response
 */
export const createPaginatedResponse = <T>(
  items: T[],
  pagination: any
): PaginatedResponse<T> => {
  return {
    data: items,
    pagination,
  };
};
