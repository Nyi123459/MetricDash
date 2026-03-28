"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";

type DashboardPaginationProps = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
};

const SIBLING_COUNT = 1;

type PaginationToken = number | "ellipsis-start" | "ellipsis-end";

export function DashboardPagination({
  currentPage,
  lastPage,
  onPageChange,
}: DashboardPaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const paginationTokens = buildPaginationTokens(currentPage, lastPage);

  return (
    <Pagination className="justify-end sm:mx-0 sm:w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          />
        </PaginationItem>

        {paginationTokens.map((token) => (
          <PaginationItem key={token}>
            {typeof token === "number" ? (
              <PaginationLink
                isActive={token === currentPage}
                onClick={() => onPageChange(token)}
              >
                {token}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage === lastPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPaginationTokens(
  currentPage: number,
  lastPage: number,
): PaginationToken[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const startPage = Math.max(2, currentPage - SIBLING_COUNT);
  const endPage = Math.min(lastPage - 1, currentPage + SIBLING_COUNT);

  const tokens: PaginationToken[] = [1];

  if (startPage > 2) {
    tokens.push("ellipsis-start");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    tokens.push(page);
  }

  if (endPage < lastPage - 1) {
    tokens.push("ellipsis-end");
  }

  tokens.push(lastPage);

  return tokens;
}
