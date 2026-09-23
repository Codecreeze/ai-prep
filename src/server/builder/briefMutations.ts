import type { Kit } from "../validation/kitSchema";
import { markEdited, type KitEditState } from "./editState";

export const editBrief = (
  kit: Kit,
  editState: KitEditState,
  updates: Partial<Kit["company_brief"]>
): { kit: Kit; editState: KitEditState } => ({
  kit: { ...kit, company_brief: { ...kit.company_brief, ...updates } },
  editState: { ...editState, brief: markEdited(editState.brief) },
});
