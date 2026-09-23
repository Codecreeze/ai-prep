import { Badge } from "@/components/ui/Badge";
import type { EditState } from "@/server/builder/editState";

// "generated" is the default/invisible state, and "pinned" is now shown by the
// filled PinButton icon itself rather than a text badge — so this only ever
// needs to flag "edited", the one state with no dedicated icon of its own.
export const EditStateBadge = ({ state }: { state: EditState | undefined }) => {
  if (state !== "edited") return null;
  return <Badge tone="neutral">Edited</Badge>;
};
