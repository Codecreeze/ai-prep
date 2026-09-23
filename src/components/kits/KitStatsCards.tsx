"use client";

import { useGetKitStatsQuery } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";

const STATS = [
  { key: "total", label: "Total kits", tone: "text-foreground" },
  { key: "ready", label: "Ready", tone: "text-emerald-600 dark:text-emerald-400" },
  { key: "pending", label: "Generating", tone: "text-amber-600 dark:text-amber-400" },
  { key: "failed", label: "Failed", tone: "text-red-600 dark:text-red-400" },
] as const;

export const KitStatsCards = () => {
  // Server-aggregated counts across every kit, not just one page of the (now
  // paginated) kit list — see api/kits/stats/route.ts.
  const { data } = useGetKitStatsQuery();
  const counts = { total: data?.total ?? 0, ready: data?.ready ?? 0, pending: data?.pending ?? 0, failed: data?.failed ?? 0 };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {STATS.map((stat) => (
        <Card key={stat.key} className="p-5">
          <p className="text-sm text-muted mb-1">{stat.label}</p>
          <p className={`text-2xl font-semibold ${stat.tone}`}>{counts[stat.key]}</p>
        </Card>
      ))}
    </div>
  );
};
