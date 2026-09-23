"use client";

import { useEffect, useRef, useState } from "react";
import { useListKitsQuery, useLazyListKitsQuery, type KitSummary } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorText } from "@/components/ui/ErrorText";
import { Spinner } from "@/components/ui/Spinner";
import { PracticeKitCard } from "./PracticeKitCard";

const PAGE_SIZE = 30;

// Practice only makes sense for kits that have finished generating (flashcards
// exist), so this asks the server for "ready" kits specifically (server-side
// filter, same `status` param KitsTable's search already exercises) — 30 at a
// time, loading the next 30 automatically as the sentinel at the bottom scrolls
// into view, instead of numbered pagination.
export const PracticeHub = () => {
  const { data, isLoading, isError } = useListKitsQuery({ page: 1, limit: PAGE_SIZE, status: "ready" });
  const [fetchMore] = useLazyListKitsQuery();
  const [extraKits, setExtraKits] = useState<KitSummary[]>([]);
  const [nextPage, setNextPage] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // The first page's result identity only changes on a real refetch (a kit
  // deleted, a new one generated) — when it does, any accumulated later pages are
  // stale against it, so drop them and start over from page 2. Reset during render
  // (the React-recommended "adjusting state when a prop changes" pattern) rather
  // than in an effect, which would cause an extra cascading render for no benefit.
  const [seenFirstPage, setSeenFirstPage] = useState(data?.kits);
  let currentExtraKits = extraKits;
  if (data?.kits !== seenFirstPage) {
    setSeenFirstPage(data?.kits);
    setExtraKits([]);
    setNextPage(2);
    currentExtraKits = []; // this render already needs the reset value, not next render's
  }

  const kits = [...(data?.kits ?? []), ...currentExtraKits];
  const total = data?.total ?? 0;
  const hasMore = kits.length < total;

  // IntersectionObserver, not a scroll listener — it's the DOM API built for exactly
  // this ("tell me when this element becomes visible"), and it doesn't fire on every
  // scroll tick like a raw listener would. A legitimate useEffect case per Rules/01:
  // subscribing to an external (browser) system, not component state.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;
        loadingRef.current = true;
        setIsLoadingMore(true);
        fetchMore({ page: nextPage, limit: PAGE_SIZE, status: "ready" })
          .unwrap()
          .then((res) => {
            setExtraKits((prev) => [...prev, ...res.kits]);
            setNextPage((p) => p + 1);
          })
          .catch(() => {})
          .finally(() => {
            loadingRef.current = false;
            setIsLoadingMore(false);
          });
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, nextPage, fetchMore]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <LoadingState className="min-h-[300px]" />
      </Card>
    );
  }
  if (isError) {
    return (
      <Card className="overflow-hidden min-h-[300px] flex items-center justify-center">
        <ErrorText>Couldn&apos;t load your kits.</ErrorText>
      </Card>
    );
  }
  if (kits.length === 0) {
    return (
      <Card className="overflow-hidden min-h-[300px] flex items-center justify-center text-sm text-muted text-center px-6">
        No kits ready to practice yet. Once a kit finishes generating, it&apos;ll show up here.
      </Card>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col gap-3 p-3">
        {kits.map((kit) => (
          <PracticeKitCard key={kit._id} kit={kit} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-5">
          {isLoadingMore && <Spinner className="size-5 text-muted" />}
        </div>
      )}
    </div>
  );
};
