import { NextRequest } from "next/server";
import { withKitEdit } from "@/server/http/withKitEdit";
import { pinQuestion } from "@/server/builder/questionMutations";

type Params = { params: Promise<{ id: string; qid: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, qid } = await params;
  return withKitEdit(id, (kit, editState) => pinQuestion(kit, editState, qid));
}
