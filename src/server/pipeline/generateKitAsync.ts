import { Kit } from "../persistence/models/Kit";
import { runPipeline } from "./orchestrator";

// Runs generation after the API has already responded with the pending kit id, so
// the request doesn't block for the 30-90s the pipeline takes. Called via Next.js's
// after() from the route handler (not a bare unawaited call) — an unawaited promise
// can get its execution context killed once the response is sent; after() keeps the
// runtime alive for this work instead. Still an in-process async function, not a
// durable job queue — a deliberate scope cut (see docs/ARCHITECTURE.md §5),
// acceptable for this assessment's scale, documented as a known limitation (a
// serverless cold-start crash mid-generation would lose the job in a real production
// system; would need Redis/BullMQ or similar there).
export async function generateKitAsync(kitId: string, input: { jd: string; companyUrl: string; days: number }) {
  try {
    await Kit.findByIdAndUpdate(kitId, { "progress.stage": "researching" });
    const kit = await runPipeline(input);
    await Kit.findByIdAndUpdate(kitId, {
      status: "ready",
      kit,
      "progress.stage": "done",
      "progress.error": null,
      updatedAt: new Date(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await Kit.findByIdAndUpdate(kitId, {
      status: "failed",
      "progress.stage": "failed",
      "progress.error": message,
      updatedAt: new Date(),
    });
  }
}
