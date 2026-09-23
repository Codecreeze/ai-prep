import mongoose, { Schema, type InferSchemaType } from "mongoose";

// `kit` and `editState` are stored as Mixed rather than a fully-typed Mongoose
// sub-schema: the Zod schema in validation/kitSchema.ts is already the single source
// of truth for the Appendix A shape, so duplicating it as a second Mongoose schema
// would just be two definitions to keep in sync for no benefit (DRY).
const kitDocSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["pending", "ready", "failed"], default: "pending" },
  progress: {
    stage: { type: String, default: "queued" },
    error: { type: String, default: null },
  },
  input: {
    jd: { type: String, required: true },
    companyUrl: { type: String, required: true },
    days: { type: Number, required: true },
  },
  dedupeHash: { type: String, required: true, index: true },
  kit: { type: Schema.Types.Mixed, default: null },
  // Mongoose quirk: a plain object-literal `default: {}` on a Mixed-typed field is
  // NOT reliably applied on document creation (confirmed by a real bug this caused —
  // see devlog). A function default (`default: () => ({})`) is the documented fix:
  // Mongoose always invokes function defaults per-document instead of special-casing
  // empty-object literals away.
  editState: {
    questions: { type: Schema.Types.Mixed, default: () => ({}) },
    flashcards: { type: Schema.Types.Mixed, default: () => ({}) },
    brief: { type: String, default: "generated" },
    schedule: { type: String, default: "generated" },
  },
  practice: {
    coveredCardIds: { type: [String], default: [] },
    confidence: { type: Schema.Types.Mixed, default: () => ({}) },
    lastSessionAt: { type: Date, default: null },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type KitDoc = InferSchemaType<typeof kitDocSchema>;
export const Kit = mongoose.models.Kit ?? mongoose.model("Kit", kitDocSchema);
