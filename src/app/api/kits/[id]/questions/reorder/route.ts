import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { reorderQuestionsInCategory } from "@/server/builder/questionMutations";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  orderedIds: z.array(z.string()),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "category and orderedIds are required");

  return withKitEdit(id, (kit, editState) =>
    reorderQuestionsInCategory(kit, editState, parsed.data.category, parsed.data.orderedIds)
  );
}
