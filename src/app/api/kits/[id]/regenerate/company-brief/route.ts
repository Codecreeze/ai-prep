import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/server/persistence/db";
import { loadReadyKitForEdit, saveKitEdit } from "@/server/persistence/kitRepo";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";
import { regenerateBrief } from "@/server/builder/regenerateBrief";

const BodySchema = z.object({ force: z.boolean().optional() });

type Params = { params: Promise<{ id: string }> };

// Brief regeneration has a confirmation step edit/pin the deterministic mutations
// don't need: pinned never regenerates; "edited" needs an explicit `force: true` to
// overwrite what the user already changed by hand, since there's nothing to merge
// (unlike questions, a brief is one blob of text, not addressable sub-items).
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const force = parsed.success ? Boolean(parsed.data.force) : false;

  await connectDb();
  const loaded = await loadReadyKitForEdit(id, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");

  if (loaded.editState.brief === "pinned") {
    return apiError(409, "BRIEF_PINNED", "The company brief is pinned and won't be regenerated");
  }
  if (loaded.editState.brief === "edited" && !force) {
    return apiError(409, "CONFIRMATION_REQUIRED", "The brief has manual edits — pass force:true to overwrite");
  }

  const { kit, editState } = await regenerateBrief(loaded.kit, loaded.editState);
  await saveKitEdit(loaded.doc, kit, editState);

  return NextResponse.json({ kit });
}
