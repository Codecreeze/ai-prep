import Link from "next/link";
import type { KitSummary } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_TONE: Record<KitSummary["status"], "warning" | "success" | "danger"> = {
  pending: "warning",
  ready: "success",
  failed: "danger",
};

export const KitCard = ({ kit }: { kit: KitSummary }) => (
  <Link href={`/kits/${kit._id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
    <Card className="p-4 hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{kit.kit?.source?.role || "Generating role..."}</p>
          <p className="text-sm text-muted truncate">{kit.kit?.source?.company || kit.input.companyUrl}</p>
        </div>
        <Badge tone={STATUS_TONE[kit.status]}>{kit.status}</Badge>
      </div>
    </Card>
  </Link>
);
