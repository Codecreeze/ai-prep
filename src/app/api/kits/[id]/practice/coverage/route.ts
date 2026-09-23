import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/server/persistence/db";
import { loadReadyKitForEdit } from "@/server/persistence/kitRepo";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";
import { computePracticeCoverage } from "@/server/practice/practiceCoverage";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectDb();
  const loaded = await loadReadyKitForEdit(id, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");

  const coveredCardIds = loaded.doc.practice?.coveredCardIds ?? [];
  const coverage = computePracticeCoverage(loaded.kit.flashcards, coveredCardIds);

  return NextResponse.json(coverage);
}
