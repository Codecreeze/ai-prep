import { NextRequest, NextResponse, after } from "next/server";
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

  // after() (not a bare unawaited call) — Next.js can freeze/kill an unawaited
  // promise once the response is sent, since the request's execution context ends
  // with the handler return. after() keeps the runtime alive for this work instead.
  after(() => generateKitAsync(doc._id.toString(), { jd, companyUrl, days }));

  return NextResponse.json({ kitId: doc._id.toString(), status: "pending" }, { status: 202 });
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50; // hard cap so a crafted ?limit= can't force an unbounded scan

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(params.get("limit")) || DEFAULT_PAGE_SIZE));
  const q = params.get("q")?.trim();
  const status = params.get("status")?.trim();

  // Search runs server-side (not just client-side filtering of one fetched page) so
  // it works correctly across the full, paginated result set, not just whatever
  // page happens to be loaded — a regex on the nested Mixed-typed source fields
  // still works fine since MongoDB queries by document structure, not schema type.
  const filter: Record<string, unknown> = { userId: auth.user.userId };
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // treat user input as a literal substring, not a regex
    filter.$or = [{ "kit.source.role": new RegExp(escaped, "i") }, { "kit.source.company": new RegExp(escaped, "i") }];
  }
  // Used by the Practice hub, which only ever wants "ready" kits — filtering
  // server-side keeps its pagination totals correct instead of paginating over an
  // already-filtered client-side slice.
  if (status === "pending" || status === "ready" || status === "failed") filter.status = status;

  const [kits, total] = await Promise.all([
    Kit.find(filter)
      .select("status input.companyUrl kit.source.role kit.source.company createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Kit.countDocuments(filter),
  ]);

  return NextResponse.json({ kits, total, page, limit });
}
