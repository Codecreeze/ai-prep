import { ChevronLeft, ChevronRight } from "lucide-react";
import { paginationRange } from "@/lib/paginationRange";

type PaginationProps = { page: number; totalPages: number; total: number; pageSize: number; onPageChange: (page: number) => void };

export const Pagination = ({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-foreground">{rangeStart}-{rangeEnd}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </p>
      <div className="flex items-center rounded-lg border border-border overflow-hidden divide-x divide-border">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="size-8 grid place-items-center text-muted hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-4" />
        </button>
        {paginationRange(page, totalPages).map((token, i) =>
          token === "ellipsis" ? (
            <span key={`e${i}`} className="size-8 grid place-items-center text-sm text-muted">…</span>
          ) : (
            <button
              key={token}
              type="button"
              onClick={() => onPageChange(token)}
              aria-current={token === page ? "page" : undefined}
              className={`size-8 grid place-items-center text-sm font-medium ${
                token === page ? "bg-primary-soft text-primary" : "text-foreground hover:bg-background"
              }`}
            >
              {token}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="size-8 grid place-items-center text-muted hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
};
