import { NextRequest } from "next/server";
import { withKitEdit } from "@/server/http/withKitEdit";
import { pinFlashcard } from "@/server/builder/flashcardMutations";

type Params = { params: Promise<{ id: string; fid: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, fid } = await params;
  return withKitEdit(id, (kit, editState) => pinFlashcard(kit, editState, fid));
}
