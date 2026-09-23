import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { editFlashcard, deleteFlashcard } from "@/server/builder/flashcardMutations";
import { apiError } from "@/server/http/apiError";
import { requireUser } from "@/server/auth/requireUser";

const BodySchema = z.object({ front: z.string().min(1).optional(), back: z.string().min(1).optional() });

type Params = { params: Promise<{ id: string; fid: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id, fid } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input");

  return withKitEdit(id, (kit, editState) => editFlashcard(kit, editState, fid, parsed.data));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, fid } = await params;
  return withKitEdit(id, (kit, editState) => deleteFlashcard(kit, editState, fid));
}
