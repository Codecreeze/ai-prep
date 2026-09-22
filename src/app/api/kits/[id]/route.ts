import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/server/persistence/db";
import { Kit } from "@/server/persistence/models/Kit";
import { requireUser } from "@/server/auth/requireUser";
import { apiError } from "@/server/http/apiError";

type Params = { params: Promise<{ id: string }> };

// 404 (not 403) for "exists but not yours" — avoids leaking which kit ids exist.
async function findOwnedKit(id: string, userId: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Kit.findOne({ _id: id, userId });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const { id } = await params;
  const kit = await findOwnedKit(id, auth.user.userId);
  if (!kit) return apiError(404, "KIT_NOT_FOUND", "No kit found with that id");

  return NextResponse.json({ kit });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await connectDb();
  const { id } = await params;
  const kit = await findOwnedKit(id, auth.user.userId);
  if (!kit) return apiError(404, "KIT_NOT_FOUND", "No kit found with that id");

  await kit.deleteOne();
  return NextResponse.json({ ok: true });
}
