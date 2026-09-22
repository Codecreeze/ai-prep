import { describe, it, expect } from "vitest";
import { categoriesFor } from "../src/server/generation/categoryRouter";
import type { Requirement } from "../src/server/validation/kitSchema";

const req = (kind: Requirement["kind"], priority: Requirement["priority"]): Requirement => ({
  id: "r1",
  text: "x",
  kind,
  priority,
});

describe("categoriesFor", () => {
  it("routes a behavioural requirement to behavioural + company-fit", () => {
    expect(categoriesFor(req("behavioural", "must"))).toEqual(["behavioural", "company-fit"]);
  });

  it("routes a domain requirement to company-fit + technical", () => {
    expect(categoriesFor(req("domain", "nice"))).toEqual(["company-fit", "technical"]);
  });

  it("routes a must-have technical requirement to technical + system-design", () => {
    expect(categoriesFor(req("technical", "must"))).toEqual(["technical", "system-design"]);
  });

  it("routes a nice-to-have technical requirement to technical only (no forced system-design)", () => {
    expect(categoriesFor(req("technical", "nice"))).toEqual(["technical"]);
  });
});
