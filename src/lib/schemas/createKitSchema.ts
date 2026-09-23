import { z } from "zod";

// Client-side validation mirroring the server's own constraints (see
// src/app/api/kits/route.ts's BodySchema) — catches obviously-invalid input before
// a round trip, with field-level messages, rather than relying on native HTML5
// validation (which is inconsistent about styling/message wording) or a server 400.
export const createKitSchema = z.object({
  jd: z.string().trim().min(20, "Paste the full job description (at least 20 characters)."),
  companyUrl: z.string().trim().url("Enter a valid URL, e.g. https://company.com"),
  days: z.number().int("Days must be a whole number").min(1, "At least 1 day").max(60, "At most 60 days"),
});

export type CreateKitFormValues = z.infer<typeof createKitSchema>;
export type CreateKitFieldErrors = Partial<Record<keyof CreateKitFormValues, string>>;
