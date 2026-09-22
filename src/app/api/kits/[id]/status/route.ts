import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/server/persistence/db";
import { Kit } from "@/server/persistence/models/Kit";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";

type Params = { params: Promise<{ id: string }> };

// Lightweight polling endpoint — the frontend hits this while a kit is generating
// instead of re-fetching the full (potentially large) kit document every few seconds.
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return apiError(404, "KIT_NOT_FOUND", "No kit found with that id");

  const kit = await Kit.findOne({ _id: id, userId: auth.user.userId }).select("status progress").lean();
  if (!kit) return apiError(404, "KIT_NOT_FOUND", "No kit found with that id");

  return NextResponse.json({ status: kit.status, progress: kit.progress });
}
