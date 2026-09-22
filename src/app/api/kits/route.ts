import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/server/persistence/db";
import { Kit } from "@/server/persistence/models/Kit";
import { computeDedupeHash } from "@/server/persistence/dedupeHash";
import { generateKitAsync } from "@/server/pipeline/generateKitAsync";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({
  jd: z.string().min(1),
  companyUrl: z.string().url(),
  days: z.number().int().min(1).max(60),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input");

  await connectDb();
  const { jd, companyUrl, days } = parsed.data;
  const dedupeHash = computeDedupeHash(jd, companyUrl);

  // Same JD + company submitted twice: reuse the existing ready kit instead of
  // re-spending LLM quota, per the brief's duplicate-submission edge case.
  const existing = await Kit.findOne({ userId: auth.user.userId, dedupeHash, status: "ready" });
  if (existing) return NextResponse.json({ kitId: existing._id.toString(), status: "ready", duplicate: true });

  const doc = await Kit.create({
    userId: auth.user.userId,
    status: "pending",
    input: { jd, companyUrl, days },
    dedupeHash,
  });

  generateKitAsync(doc._id.toString(), { jd, companyUrl, days }); // not awaited — see generateKitAsync's doc comment

  return NextResponse.json({ kitId: doc._id.toString(), status: "pending" }, { status: 202 });
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const kits = await Kit.find({ userId: auth.user.userId })
    .select("status input.companyUrl kit.source.role kit.source.company createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ kits });
}
