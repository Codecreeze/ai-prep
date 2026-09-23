import { NextResponse } from "next/server";
import { connectDb } from "../persistence/db";
import { loadReadyKitForEdit, saveKitEdit } from "../persistence/kitRepo";
import { requireUser } from "../auth/requireUser";
import { apiError } from "./apiError";
import type { Kit } from "../validation/kitSchema";
import type { KitEditState } from "../builder/editState";

type MutateResult = { kit: Kit; editState: KitEditState };

/**
 * Shared plumbing every builder-mutation route needs: auth check, load the kit
 * (404 if missing/not-owned/not-ready), run the mutation, persist, respond. Keeps
 * each individual route file down to "what mutation does this endpoint apply,"
 * not a repeat of this boilerplate (DRY, Rules/03).
 */
export async function withKitEdit(
  kitId: string,
  mutate: (kit: Kit, editState: KitEditState) => MutateResult | Promise<MutateResult>
): Promise<Response> {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const loaded = await loadReadyKitForEdit(kitId, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");

  const { kit, editState } = await mutate(loaded.kit, loaded.editState);
  await saveKitEdit(loaded.doc, kit, editState);

  return NextResponse.json({ kit });
}
