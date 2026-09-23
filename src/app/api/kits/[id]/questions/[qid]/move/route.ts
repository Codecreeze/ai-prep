import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { moveQuestionCategory } from "@/server/builder/questionMutations";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({ toCategory: z.enum(["technical", "behavioural", "system-design", "company-fit"]) });

type Params = { params: Promise<{ id: string; qid: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, qid } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "toCategory is required");

  return withKitEdit(id, (kit, editState) => moveQuestionCategory(kit, editState, qid, parsed.data.toCategory));
}
