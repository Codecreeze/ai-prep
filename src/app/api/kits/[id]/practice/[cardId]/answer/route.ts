import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/server/persistence/db";
import { loadReadyKitForEdit } from "@/server/persistence/kitRepo";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({ confidence: z.number().int().min(1).max(5) });

type Params = { params: Promise<{ id: string; cardId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id, cardId } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "confidence (1-5) is required");

  await connectDb();
  const loaded = await loadReadyKitForEdit(id, auth.user.userId);
  if (!loaded) return apiError(404, "KIT_NOT_FOUND", "No ready kit found with that id");
  if (!loaded.kit.flashcards.some((f) => f.id === cardId)) {
    return apiError(404, "CARD_NOT_FOUND", "No flashcard found with that id in this kit");
  }

  const doc = loaded.doc;
  const confidence = { ...(doc.practice?.confidence as Record<string, number> | undefined), [cardId]: parsed.data.confidence };
  const coveredCardIds = Array.from(new Set([...(doc.practice?.coveredCardIds ?? []), cardId]));

  doc.practice = { confidence, coveredCardIds, lastSessionAt: new Date() };
  doc.markModified("practice");
  await doc.save();

  return NextResponse.json({ ok: true });
}
