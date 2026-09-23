"use client";

import { useState } from "react";
import Link from "next/link";
import { useListKitsQuery, useDeleteKitMutation } from "@/lib/api/kitsApi";
import { useDebounce } from "@/lib/useDebounce";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { KitsSearchBar } from "./KitsSearchBar";
import { KitRowActions } from "./KitRowActions";

const STATUS_TONE = { pending: "warning", ready: "success", failed: "danger" } as const;
const PAGE_SIZE = 10;
// A fixed (not just minimum) height for the table area, so it truly never changes
// size regardless of row count — a `min-height` alone doesn't do this, since a full
// page of real rows renders taller than any reasonable reserved minimum, which is
// what was pushing the whole page into an outer scrollbar on shorter screens no
// matter how big that minimum was set. `clamp` keeps a floor so it's never too
// cramped, a viewport-relative middle so it fits under the page's other chrome
// (topbar + header + search bar + pagination, roughly 340px worth), and a ceiling
// so it doesn't grow pointlessly tall on very large screens. The table area itself
// scrolls internally (sticky header) when its 10 rows don't all fit, instead of the
// whole page scrolling.
const TABLE_AREA_HEIGHT = 43 * (PAGE_SIZE + 1);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// The full, persisted list of every kit the user has ever generated — distinct from
// the "recent 5" shown on the Analyze and Analytics pages, which are a glance, not
// a record. This is the actual record: paginated (10/page) and searched server-side,
// so it stays correct and fast regardless of how many kits the user has generated.
export const KitsTable = () => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useListKitsQuery({ page, limit: PAGE_SIZE, q: debouncedSearch || undefined });
  const [deleteKit] = useDeleteKitMutation();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1); // a new search always starts back at page 1
  };

  const kits = data?.kits ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <>
      <KitsSearchBar value={searchInput} onChange={handleSearchChange} />

      <Card className="overflow-hidden">
        <div className="flex flex-col" style={{ height: TABLE_AREA_HEIGHT }}>
          {isLoading ? (
            <LoadingState className="flex-1" />
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted text-center px-6">
              Couldn&apos;t load your kits. Try refreshing.
            </div>
          ) : kits.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted text-center px-6">
              {debouncedSearch ? `No kits match "${debouncedSearch}".` : "No kits yet. Create one from the Analyze page to get started."}
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface z-10">
                  <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={isFetching ? "opacity-50 transition-opacity" : "transition-opacity"}>
                  {kits.map((kit) => {
                    const label = kit.kit?.source?.role || "this kit";
                    return (
                      <tr key={kit._id} className="border-b border-border last:border-0 hover:bg-background">
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/kits/${kit._id}`} className="font-medium text-foreground hover:text-primary">
                            {kit.kit?.source?.role || "Generating..."}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted">{kit.kit?.source?.company || kit.input.companyUrl}</td>
                        <td className="px-4 py-3"><Badge tone={STATUS_TONE[kit.status]}>{kit.status}</Badge></td>
                        <td className="px-4 py-3 text-muted">{formatDate(kit.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <KitRowActions kitId={kit._id} status={kit.status} onDelete={() => setPendingDelete({ id: kit._id, label })} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!isLoading && !isError && kits.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={data?.total ?? 0} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete kit?"
          message={`This permanently deletes "${pendingDelete.label}" and everything in it. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteKit(pendingDelete.id);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
};
