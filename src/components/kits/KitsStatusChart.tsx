"use client";

import { useGetKitStatsQuery } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";

const BARS = [
  { key: "ready", label: "Ready", color: "#0d9488" },
  { key: "pending", label: "Generating", color: "#d97706" },
  { key: "failed", label: "Failed", color: "#dc2626" },
] as const;

// A hand-rolled inline-SVG bar chart over real kit counts — no charting library
// pulled in for three bars (Rules/03: no unnecessary dependencies). Real data only:
// no fabricated numbers, unlike a typical dashboard demo's placeholder chart.
export const KitsStatusChart = () => {
  // Server-aggregated counts across every kit, not just one page of the list.
  const { data } = useGetKitStatsQuery();
  const counts = BARS.map((b) => data?.[b.key] ?? 0);
  const max = Math.max(1, ...counts);

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-1">Kits by status</h3>
      <p className="text-xs text-muted mb-6">All kits you&apos;ve generated, grouped by their current status.</p>
      <div className="flex items-end gap-6 h-40">
        {BARS.map((bar, i) => (
          <div key={bar.key} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-sm font-medium text-foreground">{counts[i]}</span>
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md transition-[height]"
                style={{ height: `${(counts[i] / max) * 100}%`, backgroundColor: bar.color, minHeight: counts[i] > 0 ? 4 : 0 }}
              />
            </div>
            <span className="text-xs text-muted">{bar.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
