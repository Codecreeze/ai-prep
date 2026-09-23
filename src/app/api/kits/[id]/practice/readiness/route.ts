import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/server/persistence/db";
import { loadReadyKitForEdit } from "@/server/persistence/kitRepo";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";
import { computeReadinessScore } from "@/server/practice/readinessScore";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectDb();
  const loaded = await loadReadyKitForEdit(id, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");

  const confidence = (loaded.doc.practice?.confidence as Record<string, number> | undefined) ?? {};
  const readiness = computeReadinessScore(loaded.kit.role.requirements, loaded.kit.questions, loaded.kit.flashcards, confidence);

  return NextResponse.json(readiness);
}
