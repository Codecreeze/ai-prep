import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { addQuestion } from "@/server/builder/questionMutations";
import { apiError } from "@/server/http/apiError";
import { requireUser } from "@/server/auth/requireUser";

const BodySchema = z.object({
  requirement_ids: z.array(z.string()),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  prompt: z.string().min(1),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
});

type Params = { params: Promise<{ id: string }> };

// Add a question by hand — the brief's "add a question... by hand, and delete one".
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input");

  return withKitEdit(id, (kit, editState) => addQuestion(kit, editState, parsed.data));
}
