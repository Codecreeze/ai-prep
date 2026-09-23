import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/server/persistence/db";
import { Kit } from "@/server/persistence/models/Kit";
import { requireUser } from "@/server/auth/requireUser";

// Separate from the paginated list endpoint on purpose: the stat cards and status
// chart need counts across every kit the user has, not just whatever page happens
// to be loaded — that's a DB-side aggregation, not something to derive by fetching
// N records and counting them client-side.
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  // Raw aggregate() pipelines don't auto-cast query values the way find() does —
  // userId has to be converted to ObjectId explicitly or $match silently matches nothing.
  const counts = await Kit.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(auth.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byStatus: Record<string, number> = { pending: 0, ready: 0, failed: 0 };
  for (const row of counts) byStatus[row._id] = row.count;
  const total = byStatus.pending + byStatus.ready + byStatus.failed;

  return NextResponse.json({ total, ...byStatus });
}
