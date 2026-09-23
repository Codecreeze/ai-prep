import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/server/persistence/db";
import { loadReadyKitForEdit, saveKitEdit } from "@/server/persistence/kitRepo";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";
import { regenerateSchedule } from "@/server/builder/regenerateSchedule";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectDb();
  const loaded = await loadReadyKitForEdit(id, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");

  if (loaded.editState.schedule === "pinned") {
    return apiError(409, "SCHEDULE_PINNED", "The schedule is pinned and won't be regenerated");
  }

  const { kit, editState } = regenerateSchedule(loaded.kit, loaded.editState);
  await saveKitEdit(loaded.doc, kit, editState);

  return NextResponse.json({ kit });
}
