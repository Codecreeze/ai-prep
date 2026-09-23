import { NextRequest } from "next/server";
import { z } from "zod";
import { withKitEdit } from "@/server/http/withKitEdit";
import { editBrief } from "@/server/builder/briefMutations";
import { apiError } from "@/server/http/apiError";
import { requireUser } from "@/server/auth/requireUser";

const BodySchema = z.object({ summary: z.string().optional(), what_they_do: z.string().optional() });

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid input");

  return withKitEdit(id, (kit, editState) => editBrief(kit, editState, parsed.data));
}
