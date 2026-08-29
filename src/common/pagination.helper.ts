import { PaginationInfo } from './pagination.type';

export function buildPagination(
  page: number,
  limit: number,
  total: number,
): PaginationInfo {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}
