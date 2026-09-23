"use client";

import { useState } from "react";
import { useCreateKitMutation } from "@/lib/api/kitsApi";
import { useAppDispatch } from "@/lib/hooks";
import { watchKit } from "@/lib/uiSlice";
import { createKitSchema, type CreateKitFieldErrors } from "@/lib/schemas/createKitSchema";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { ErrorText } from "@/components/ui/ErrorText";
import { Spinner } from "@/components/ui/Spinner";

// A submission stays visibly "Starting..." for at least this long — the create
// call itself is fast (the server responds as soon as the kit is queued, well
// before generation finishes), so without a floor the spinner could flash for a
// few hundred ms and read as if nothing happened.
const MIN_VISIBLE_LOADING_MS = 500;

export const CreateKitForm = () => {
  const dispatch = useAppDispatch();
  const [createKit] = useCreateKitMutation();
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(5);
  const [fieldErrors, setFieldErrors] = useState<CreateKitFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = createKitSchema.safeParse({ jd, companyUrl, days });
    if (!parsed.success) {
      const errors: CreateKitFieldErrors = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as keyof CreateKitFieldErrors] = issue.message;
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const startedAt = Date.now();
    try {
      const result = await createKit(parsed.data).unwrap();
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_VISIBLE_LOADING_MS) await new Promise((r) => setTimeout(r, MIN_VISIBLE_LOADING_MS - elapsed));
      // Stay on this page — the user can keep creating kits while this one
      // generates in the background. KitCompletionWatcher + KitCompletionModal
      // (mounted in the dashboard layout) pop up once it's ready or failed. Success
      // feedback is the toast fired by kitsApi's onQueryStarted (driven by RTK
      // Query's own fulfilled state) — no separate "just submitted" message that
      // would need a timer to clear itself.
      dispatch(watchKit(result.kitId));
      setJd("");
      setCompanyUrl("");
      setDays(5);
    } catch (err) {
      const message = (err as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(message ?? "Couldn't create kit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <h2 className="font-semibold text-foreground">New interview prep kit</h2>
          <p className="text-sm text-muted mt-0.5">Paste the job description and the company&apos;s site — we&apos;ll do the research.</p>
        </div>
        <div>
          <TextAreaField
            label="Job description"
            rows={6}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here"
          />
          {fieldErrors.jd && <p className="text-xs text-red-600 mt-1">{fieldErrors.jd}</p>}
        </div>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4">
          <div>
            <TextField
              label="Company website"
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://company.com"
            />
            {fieldErrors.companyUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.companyUrl}</p>}
          </div>
          <div>
            <TextField
              label="Days until interview"
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="sm:w-32"
            />
            {fieldErrors.days && <p className="text-xs text-red-600 mt-1">{fieldErrors.days}</p>}
          </div>
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Starting..." : "Generate kit"}
        </Button>
      </form>
    </Card>
  );
};
