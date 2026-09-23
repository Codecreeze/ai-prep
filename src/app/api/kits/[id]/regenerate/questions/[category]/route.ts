import { NextRequest } from "next/server";
import { withKitEdit } from "@/server/http/withKitEdit";
import { regenerateQuestionsCategory } from "@/server/builder/regenerateQuestionsCategory";
import { apiError } from "@/server/http/apiError";
import type { Question } from "@/server/validation/kitSchema";

const VALID_CATEGORIES = ["technical", "behavioural", "system-design", "company-fit"];

type Params = { params: Promise<{ id: string; category: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, category } = await params;
  if (!VALID_CATEGORIES.includes(category)) return apiError(400, "VALIDATION_ERROR", "Unknown category");

  return withKitEdit(id, (kit, editState) => regenerateQuestionsCategory(kit, editState, category as Question["category"]));
}
