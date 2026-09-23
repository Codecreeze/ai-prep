import Link from "next/link";
import type { Kit } from "@/server/validation/kitSchema";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const STATUS_TONE = { pending: "warning", ready: "success", failed: "danger" } as const;

export const KitDetailHeader = ({ kitId, status, source }: { kitId: string; status: "pending" | "ready" | "failed"; source?: Kit["source"] }) => (
  <div className="mb-6">
    <Link href="/dashboard/kits" className="text-sm text-primary hover:underline mb-2 inline-block">← Back to Kits</Link>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-foreground">{source?.role || "Generating kit..."}</h1>
          <Badge tone={STATUS_TONE[status]}>{status}</Badge>
        </div>
        <p className={`text-sm text-muted mt-1 ${source?.company ? "capitalize" : ""}`}>{source?.company || source?.company_url}</p>
      </div>
      <Link href={`/dashboard/practice/${kitId}`}>
        <Button variant="secondary">Practice flashcards</Button>
      </Link>
    </div>
  </div>
);
