"use client";

import { useRef, useState } from "react";
import { useCreateKitMutation } from "@/lib/api/kitsApi";
import { useAppDispatch } from "@/lib/hooks";
import { watchKit } from "@/lib/uiSlice";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

type BatchCase = { jd: string; companyUrl: string; days: number };

// Same shape the batch `evaluate` CLI's cases.json uses (Appendix B: id, jd,
// company_url, days) — this is the brief's "uploading a file of description-and-
// company pairs" path, distinct from "pasting again" (CreateKitForm, which already
// supports queuing one more kit without navigating away).
const parseCasesFile = async (file: File): Promise<BatchCase[]> => {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!Array.isArray(data) || data.length === 0) throw new Error('Expected a JSON array of cases, e.g. [{ "jd", "company_url", "days" }].');

  return data.map((entry, i) => {
    const c = entry as Record<string, unknown>;
    if (typeof c.jd !== "string" || !c.jd.trim()) throw new Error(`Case ${i + 1} is missing "jd".`);
    if (typeof c.company_url !== "string" || !c.company_url.trim()) throw new Error(`Case ${i + 1} is missing "company_url".`);
    return { jd: c.jd, companyUrl: c.company_url, days: typeof c.days === "number" && c.days > 0 ? c.days : 5 };
  });
};

export const BatchUploadForm = () => {
  const dispatch = useAppDispatch();
  const [createKit] = useCreateKitMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const cases = await parseCasesFile(file);
      // Sequential, not Promise.all — reuses the same single-kit create endpoint
      // per case (not a parallel implementation) and avoids bursting the LLM
      // rate limiter with N simultaneous kit generations at once. Each call
      // already fires its own success toast (kitsApi's onQueryStarted), so there's
      // no separate "queued N kits" message here that would need a timer to clear.
      for (const c of cases) {
        const result = await createKit({ jd: c.jd, companyUrl: c.companyUrl, days: c.days }).unwrap();
        dispatch(watchKit(result.kitId));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(message ?? "Couldn't process that file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="font-semibold text-foreground">Prepare for more than one role</h2>
      <p className="text-sm text-muted mt-0.5 mb-4">
        Upload a JSON file of description-and-company pairs to queue several kits at once, instead of pasting one at a time.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        disabled={isSubmitting}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // allow re-selecting the same file after an error
          if (file) handleFile(file);
        }}
      />
      <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => inputRef.current?.click()}>
        {isSubmitting ? "Queuing..." : "Upload cases file"}
      </Button>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}
    </Card>
  );
};
