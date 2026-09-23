import type { Kit } from "../validation/kitSchema";
import { buildSchedule } from "../scheduler/buildSchedule";
import type { KitEditState } from "./editState";

// No LLM call — the schedule is pure allocation over the current requirements and
// questions, so "regenerate" here just means "recompute", always safe unless pinned
// (checked by the caller). This matches the brief: scheduling is arithmetic, not the
// model's decision, so there's no "ask the model again" step to protect edits from.
export function regenerateSchedule(kit: Kit, editState: KitEditState): { kit: Kit; editState: KitEditState } {
  const schedule = buildSchedule(kit.role.requirements, kit.questions, kit.schedule.days_available);
  return { kit: { ...kit, schedule }, editState: { ...editState, schedule: "generated" } };
}
