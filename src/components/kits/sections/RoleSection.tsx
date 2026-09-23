import type { Kit } from "@/server/validation/kitSchema";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "./SectionHeading";

export const RoleSection = ({ role }: { role: Kit["role"] }) => (
  <Card className="p-6 mb-6">
    <SectionHeading>{role.title}</SectionHeading>
    <p className="text-sm text-muted mb-4 -mt-2">{role.seniority}</p>

    {role.responsibilities.length > 0 && (
      <ul className="list-disc list-inside text-sm text-foreground mb-5 space-y-1">
        {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    )}

    <ul className="flex flex-col gap-2.5">
      {role.requirements.map((req) => (
        <li key={req.id} className="flex items-center gap-2.5 text-sm">
          <Badge tone={req.priority === "must" ? "danger" : "neutral"}>{req.priority}</Badge>
          <span className="text-foreground">{req.text}</span>
        </li>
      ))}
    </ul>
  </Card>
);
