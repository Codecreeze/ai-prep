"use client";

import type { Requirement } from "@/server/validation/kitSchema";
import { useGetReadinessScoreQuery } from "@/lib/api/practiceApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const scoreTone = (score: number): "success" | "warning" | "danger" => (score >= 80 ? "success" : score >= 50 ? "warning" : "danger");

export const ReadinessScoreCard = ({ kitId, requirements }: { kitId: string; requirements: Requirement[] }) => {
  const { data } = useGetReadinessScoreQuery(kitId);
  if (!data) return null;

  // Weakest first — the whole point of a readiness report is surfacing what to fix.
  const sorted = [...requirements].sort((a, b) => data.byRequirement[a.id].score - data.byRequirement[b.id].score);
  const weakest = sorted.filter((r) => data.byRequirement[r.id].score < 100).slice(0, 3);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-foreground text-lg">Readiness score</h2>
        <span className={`text-2xl font-bold ${data.overall >= 80 ? "text-emerald-600" : data.overall >= 50 ? "text-amber-600" : "text-red-600"}`}>
          {data.overall}%
        </span>
      </div>
      <p className="text-xs text-muted mb-4">
        Combines whether each requirement has a question and how confident you felt practicing it — weighted toward must-haves.
      </p>
      {weakest.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Focus areas</p>
          <ul className="flex flex-col gap-2">
            {weakest.map((r) => {
              const entry = data.byRequirement[r.id];
              return (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <Badge tone={r.priority === "must" ? "danger" : "neutral"}>{r.priority}</Badge>
                  <span className="flex-1 text-foreground">{r.text}</span>
                  <Badge tone={scoreTone(entry.score)}>{Math.round(entry.score)}%</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {weakest.length === 0 && <p className="text-sm text-emerald-600">Every requirement is fully covered and confidently practiced.</p>}
    </Card>
  );
};
