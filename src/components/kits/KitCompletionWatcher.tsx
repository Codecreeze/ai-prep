"use client";

import { useEffect, useRef } from "react";
import { useListKitsQuery } from "@/lib/api/kitsApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { unwatchKit, setCompletedKitNotice } from "@/lib/uiSlice";

// Renders nothing — its only job is watching kits the user chose to keep working
// while they generate (see CreateKitForm) and surfacing a completion modal once one
// finishes. This is one of the few legitimate useEffect/useRef cases in this codebase
// (Rules/01): it reacts to a genuinely external, asynchronous system (a background
// generation job whose state changes independently of any user action in this
// component tree), and the ref exists to remember each watched kit's *previous*
// status across polls so a status *transition* (not just "is it ready") can be
// detected — not a substitute for ordinary component state.
export const KitCompletionWatcher = () => {
  const dispatch = useAppDispatch();
  const watchingKitIds = useAppSelector((s) => s.ui.watchingKitIds);
  const { data } = useListKitsQuery(undefined, { pollingInterval: 4000, skip: watchingKitIds.length === 0 });
  const lastKnownStatus = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    for (const kitId of watchingKitIds) {
      const kit = data.kits.find((k) => k._id === kitId);
      if (!kit) {
        // A kit can be briefly absent from a stale cache snapshot right after
        // creation (the create mutation's cache-invalidating refetch hasn't landed
        // yet) — only treat it as genuinely deleted if we'd previously observed it
        // at least once; otherwise just wait for the next poll instead of dropping
        // the watch on a kit we never got to see.
        if (lastKnownStatus.current[kitId] !== undefined) dispatch(unwatchKit(kitId));
        continue;
      }
      const previous = lastKnownStatus.current[kitId];
      lastKnownStatus.current[kitId] = kit.status;
      // Notify on any pending->done transition, and also if the very first poll
      // already finds it done (generation can finish faster than the poll interval).
      if (previous !== "ready" && previous !== "failed" && (kit.status === "ready" || kit.status === "failed")) {
        dispatch(setCompletedKitNotice({
          id: kitId,
          role: kit.kit?.source?.role || "Untitled role",
          company: kit.kit?.source?.company || kit.input.companyUrl,
          status: kit.status,
        }));
        dispatch(unwatchKit(kitId));
      }
    }
  }, [data, watchingKitIds, dispatch]);

  return null;
};
