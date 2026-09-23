import { Badge } from "@/components/ui/Badge";
import type { EditState } from "@/server/builder/editState";

// "generated" is the default/invisible state — only edited/pinned items get a badge,
// so the UI isn't cluttered with a label on every single item.
export const EditStateBadge = ({ state }: { state: EditState | undefined }) => {
  if (!state || state === "generated") return null;
  return <Badge tone={state === "pinned" ? "info" : "neutral"}>{state}</Badge>;
};
