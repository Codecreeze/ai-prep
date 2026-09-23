"use client";

import { useListKitsQuery } from "@/lib/api/kitsApi";
import { KitCard } from "./KitCard";
import { KitListEmptyState } from "./KitListEmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorText } from "@/components/ui/ErrorText";

export const KitList = () => {
  // Poll while any kit is still generating — RTK Query handles this natively,
  // no useEffect/setInterval needed.
  const { data, isLoading, isError } = useListKitsQuery(undefined, { pollingInterval: 5000 });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted text-sm py-6">
        <Spinner /> Loading your kits...
      </div>
    );
  }
  if (isError) return <ErrorText>Couldn&apos;t load your kits. Try refreshing.</ErrorText>;
  if (!data || data.kits.length === 0) return <KitListEmptyState />;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {data.kits.map((kit) => (
        <li key={kit._id}>
          <KitCard kit={kit} />
        </li>
      ))}
    </ul>
  );
};
