import mongoose from "mongoose";
import { Kit as KitModel } from "./models/Kit";
import { emptyEditState, type KitEditState } from "../builder/editState";
import type { Kit } from "../validation/kitSchema";

export type LoadedKit = {
  doc: InstanceType<typeof KitModel>;
  kit: Kit;
  editState: KitEditState;
};

/** Loads a ready kit owned by `userId`, or null if it doesn't exist / isn't ready / isn't theirs. */
export async function loadReadyKitForEdit(kitId: string, userId: string): Promise<LoadedKit | null> {
  if (!mongoose.isValidObjectId(kitId)) return null;
  const doc = await KitModel.findOne({ _id: kitId, userId });
  if (!doc || doc.status !== "ready" || !doc.kit) return null;
  // Deep-merged against emptyEditState() — a kit created before the Mongoose
  // Mixed-default fix (see devlog) can have a partial editState object (e.g. missing
  // `questions`/`flashcards` keys entirely), which would otherwise throw the moment
  // any mutation tries to read editState.questions[id] on undefined.
  const editState = { ...emptyEditState(), ...(doc.editState as Partial<KitEditState> | undefined) };
  return { doc, kit: doc.kit as Kit, editState };
}

/** Persists an updated kit + editState back onto the same document. */
export async function saveKitEdit(doc: LoadedKit["doc"], kit: Kit, editState: KitEditState): Promise<void> {
  doc.kit = kit;
  doc.editState = editState;
  doc.updatedAt = new Date();
  // Mongoose can't detect in-place mutation of Mixed fields on its own — mark
  // explicitly so the whole kit/editState subtree is actually written on save.
  doc.markModified("kit");
  doc.markModified("editState");
  await doc.save();
}
