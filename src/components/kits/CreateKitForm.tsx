"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateKitMutation } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { ErrorText } from "@/components/ui/ErrorText";
import { Spinner } from "@/components/ui/Spinner";

export const CreateKitForm = () => {
  const router = useRouter();
  const [createKit, { isLoading }] = useCreateKitMutation();
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await createKit({ jd, companyUrl, days }).unwrap();
      router.push(`/kits/${result.kitId}`);
    } catch (err) {
      const message = (err as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(message ?? "Couldn't create kit");
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-foreground">New interview prep kit</h2>
          <p className="text-sm text-muted mt-0.5">Paste the job description and the company&apos;s site — we&apos;ll do the research.</p>
        </div>
        <TextAreaField
          label="Job description"
          required
          rows={6}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here"
        />
        <div className="grid sm:grid-cols-[1fr_auto] gap-4">
          <TextField
            label="Company website"
            type="url"
            required
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://company.com"
          />
          <TextField
            label="Days until interview"
            type="number"
            required
            min={1}
            max={60}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="sm:w-32"
          />
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={isLoading} className="self-start">
          {isLoading && <Spinner />}
          {isLoading ? "Starting..." : "Generate kit"}
        </Button>
      </form>
    </Card>
  );
};
