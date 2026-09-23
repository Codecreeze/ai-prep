import Link from "next/link";
import type { KitSummary } from "@/lib/api/kitsApi";
import { useGetReadinessScoreQuery } from "@/lib/api/practiceApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const scoreTone = (score: number) => (score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600");

// One card per ready kit — its own readiness-score subscription (a small,
// per-kit query, already used elsewhere) rather than fetching every kit's full
// document up front just to show a number on a hub page.
export const PracticeKitCard = ({ kit }: { kit: KitSummary }) => {
  const { data } = useGetReadinessScoreQuery(kit._id);
  const companyName = kit.kit?.source?.company;

  return (
    <Card className="p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{kit.kit?.source?.role || "Untitled role"}</p>
        <p className={`text-sm text-muted truncate ${companyName ? "capitalize" : ""}`}>{companyName || kit.input.companyUrl}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {data && <span className={`text-lg font-bold ${scoreTone(data.overall)}`}>{data.overall}%</span>}
        <Link href={`/dashboard/practice/${kit._id}`}>
          <Button variant="secondary">Practice</Button>
        </Link>
      </div>
    </Card>
  );
};
