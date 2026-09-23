import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { editQuestion, deleteQuestion } from "@/server/builder/questionMutations";
import { apiError } from "@/server/http/apiError";
import { requireUser } from "@/server/auth/requireUser";

const BodySchema = z.object({
  prompt: z.string().min(1).optional(),
  answer_outline: z.string().optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
});

type Params = { params: Promise<{ id: string; qid: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id, qid } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input");

  return withKitEdit(id, (kit, editState) => editQuestion(kit, editState, qid, parsed.data));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, qid } = await params;
  return withKitEdit(id, (kit, editState) => deleteQuestion(kit, editState, qid));
}
