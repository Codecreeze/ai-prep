import { z } from "zod";

// Mirrors Appendix A of the assessment brief EXACTLY — field names/shape must not
// be renamed. This is the single source of truth used to validate kit output both
// in the web app and in the batch `evaluate` command before either persists/writes it.

export const RequirementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  kind: z.enum(["technical", "behavioural", "domain"]),
  priority: z.enum(["must", "nice"]),
});
export type Requirement = z.infer<typeof RequirementSchema>;

export const QuestionSchema = z.object({
  id: z.string().min(1),
  requirement_ids: z.array(z.string()),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  prompt: z.string().min(1),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
});
export type Question = z.infer<typeof QuestionSchema>;

export const FlashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string()),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const ScheduleDaySchema = z.object({
  day: z.number().int().min(1),
  focus: z.string(),
  question_ids: z.array(z.string()),
  minutes: z.number().int().min(0),
});
export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;

export const KitSchema = z.object({
  source: z.object({
    company: z.string(),
    company_url: z.string(),
    role: z.string(),
    location: z.string(),
    jd_chars: z.number().int().min(0),
    researched_at: z.string(),
    pages_used: z.array(z.string()),
  }),
  company_brief: z.object({
    summary: z.string(),
    what_they_do: z.string(),
    sources: z.array(z.string()),
  }),
  role: z.object({
    title: z.string(),
    seniority: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(RequirementSchema),
  }),
  questions: z.array(QuestionSchema),
  flashcards: z.array(FlashcardSchema),
  schedule: z.object({
    days_available: z.number().int().min(1),
    days: z.array(ScheduleDaySchema),
  }),
  coverage: z.object({
    uncovered_requirement_ids: z.array(z.string()),
    passes: z.number().int().min(0),
  }),
});
export type Kit = z.infer<typeof KitSchema>;

/**
 * Validates a kit and additionally checks referential integrity that Zod's shape
 * checks alone can't express: every question.requirement_ids and every
 * schedule.days[].question_ids must point at ids that actually exist in the kit.
 */
export function validateKit(candidate: unknown):
  | { ok: true; kit: Kit }
  | { ok: false; errors: string[] } {
  const parsed = KitSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  }
  const kit = parsed.data;
  const errors: string[] = [];
  const requirementIds = new Set(kit.role.requirements.map((r) => r.id));
  const questionIds = new Set(kit.questions.map((q) => q.id));

  for (const q of kit.questions) {
    for (const rid of q.requirement_ids) {
      if (!requirementIds.has(rid)) errors.push(`question ${q.id} references unknown requirement ${rid}`);
    }
  }
  for (const f of kit.flashcards) {
    for (const rid of f.requirement_ids) {
      if (!requirementIds.has(rid)) errors.push(`flashcard ${f.id} references unknown requirement ${rid}`);
    }
  }
  for (const day of kit.schedule.days) {
    for (const qid of day.question_ids) {
      if (!questionIds.has(qid)) errors.push(`schedule day ${day.day} references unknown question ${qid}`);
    }
  }
  if (kit.schedule.days.length !== kit.schedule.days_available) {
    errors.push(`schedule.days has ${kit.schedule.days.length} entries but days_available is ${kit.schedule.days_available}`);
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, kit };
}
