import { NextRequest } from "next/server";
import { withKitEdit } from "@/server/http/withKitEdit";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withKitEdit(id, (kit, editState) => ({ kit, editState: { ...editState, brief: "pinned" } }));
}
