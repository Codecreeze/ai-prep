import { paginationRange } from "@/lib/paginationRange";

type PaginationProps = { page: number; totalPages: number; total: number; pageSize: number; onPageChange: (page: number) => void };

const ChevronLeft = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
);

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
          <ChevronLeft />
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
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
