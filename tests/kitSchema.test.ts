import { describe, it, expect } from "vitest";
import { validateKit } from "../src/server/validation/kitSchema";

const validKit = {
  source: {
    company: "Acme",
    company_url: "http://localhost:8099/acme/",
    role: "Backend Engineer",
    location: "Remote",
    jd_chars: 500,
    researched_at: "2026-09-22T00:00:00Z",
    pages_used: ["http://localhost:8099/acme/careers"],
  },
  company_brief: { summary: "s", what_they_do: "d", sources: [] },
  role: {
    title: "Backend Engineer",
    seniority: "Senior",
    responsibilities: ["Build APIs"],
    requirements: [{ id: "r1", text: "5+ years Node", kind: "technical", priority: "must" }],
  },
  questions: [
    { id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "p", answer_outline: "a", difficulty: 2 },
  ],
  flashcards: [{ id: "f1", front: "f", back: "b", requirement_ids: ["r1"] }],
  schedule: { days_available: 1, days: [{ day: 1, focus: "Node", question_ids: ["q1"], minutes: 15 }] },
  coverage: { uncovered_requirement_ids: [], passes: 1 },
};

describe("validateKit", () => {
  it("accepts a structurally valid kit", () => {
    const result = validateKit(validKit);
    expect(result.ok).toBe(true);
  });

  it("rejects a kit missing a required field", () => {
    const { role: _role, ...rest } = validKit;
    const result = validateKit(rest);
    expect(result.ok).toBe(false);
  });

  it("rejects minutes as a float", () => {
    const bad = { ...validKit, schedule: { ...validKit.schedule, days: [{ ...validKit.schedule.days[0], minutes: 15.5 }] } };
    const result = validateKit(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects a priority outside must|nice", () => {
    const bad = {
      ...validKit,
      role: { ...validKit.role, requirements: [{ ...validKit.role.requirements[0], priority: "optional" }] },
    };
    const result = validateKit(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects a question referencing a non-existent requirement id", () => {
    const bad = { ...validKit, questions: [{ ...validKit.questions[0], requirement_ids: ["r-missing"] }] };
    const result = validateKit(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("unknown requirement"))).toBe(true);
  });

  it("rejects a schedule day referencing a non-existent question id", () => {
    const bad = {
      ...validKit,
      schedule: { ...validKit.schedule, days: [{ ...validKit.schedule.days[0], question_ids: ["q-missing"] }] },
    };
    const result = validateKit(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects when schedule.days.length does not match days_available", () => {
    const bad = { ...validKit, schedule: { ...validKit.schedule, days_available: 3 } };
    const result = validateKit(bad);
    expect(result.ok).toBe(false);
  });
});
