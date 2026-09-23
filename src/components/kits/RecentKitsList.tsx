"use client";

import Link from "next/link";
import { useListKitsQuery } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_TONE = { pending: "warning", ready: "success", failed: "danger" } as const;

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const RecentKitsList = () => {
  // Server already sorts newest-first and paginates — ask for exactly the 5 we show
  // instead of fetching everything and slicing client-side.
  const { data } = useListKitsQuery({ limit: 5 });
  const recent = data?.kits ?? [];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-1">Recent activity</h3>
      <p className="text-xs text-muted mb-4">Your most recently created kits.</p>
      {recent.length === 0 ? (
        <p className="text-sm text-muted">No kits yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {recent.map((kit) => (
            <li key={kit._id}>
              <Link href={`/dashboard/kits/${kit._id}`} className="flex items-center justify-between gap-3 group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                    {kit.kit?.source?.role || "Generating..."}
                  </p>
                  <p className="text-xs text-muted truncate">{kit.kit?.source?.company || kit.input.companyUrl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted">{timeAgo(kit.createdAt)}</span>
                  <Badge tone={STATUS_TONE[kit.status]}>{kit.status}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
