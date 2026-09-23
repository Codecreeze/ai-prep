"use client";

import { useGetPracticeCoverageQuery } from "@/lib/api/practiceApi";

export const PracticeCoverageBar = ({ kitId }: { kitId: string }) => {
  const { data } = useGetPracticeCoverageQuery(kitId);
  if (!data) return null;

  const pct = data.totalCount ? Math.round((data.coveredCount / data.totalCount) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted">Covered</span>
        <span className="font-medium text-foreground">{data.coveredCount} / {data.totalCount}</span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
