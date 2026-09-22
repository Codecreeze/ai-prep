import { describe, it, expect } from "vitest";
import { rankLinks } from "../src/server/crawler/rankLinks";

describe("rankLinks", () => {
  it("ranks an unconventional hiring path above a generic about page", () => {
    const links = [
      { url: "/about", text: "About Us" },
      { url: "/company/work-with-us", text: "Work With Us" },
    ];
    const ranked = rankLinks(links);
    expect(ranked[0].url).toBe("/company/work-with-us");
  });

  it("ranks careers/jobs paths highly even without exact-path matching", () => {
    const links = [
      { url: "/random-page-123", text: "Random" },
      { url: "/handbook/hiring-process", text: "Our Hiring Process" },
    ];
    const ranked = rankLinks(links);
    expect(ranked[0].url).toBe("/handbook/hiring-process");
  });

  it("filters out noise links (privacy, terms, login)", () => {
    const links = [
      { url: "/privacy-policy", text: "Privacy" },
      { url: "/careers", text: "Careers" },
    ];
    const ranked = rankLinks(links);
    expect(ranked.map((l) => l.url)).toEqual(["/careers"]);
  });

  it("engineering blog scores above a plain page with no signal", () => {
    const links = [
      { url: "/products", text: "Products" },
      { url: "/blog/engineering/how-we-hire", text: "How We Hire" },
    ];
    const ranked = rankLinks(links);
    expect(ranked[0].url).toBe("/blog/engineering/how-we-hire");
  });
});
