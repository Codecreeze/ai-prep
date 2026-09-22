import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { crawlCompanySite } from "../src/server/crawler/crawlCompanySite";

// Local fixture server mirrors how the batch grader serves company sites
// (Appendix B's `http://localhost:8099/acme/` example) — deliberately uses an
// unconventional hiring path to prove rankLinks isn't just matching /careers.
const PAGES: Record<string, string> = {
  "/": `<html><body>
      <h1>Acme Corp</h1><p>We build widgets.</p>
      <nav><a href="/about">About</a></nav>
      <a href="/company/work-with-us">Work With Us</a>
      <a href="/careers/internal-notes">Careers Internal Notes</a>
    </body></html>`,
  "/company/work-with-us": `<html><body>
      <h1>Hiring at Acme</h1>
      <p>Our process: take-home, then a system design interview.</p>
    </body></html>`,
  "/about": `<html><body><p>Acme was founded in 2020.</p></body></html>`,
  "/careers/internal-notes": `<html><body><p>Should never be fetched — disallowed.</p></body></html>`,
  "/robots.txt": "User-agent: *\nDisallow: /careers/internal-notes\n",
};

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.ALLOW_LOCAL_URLS = "true";
  server = http.createServer((req, res) => {
    const body = PAGES[req.url ?? "/"];
    if (!body) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": req.url === "/robots.txt" ? "text/plain" : "text/html" });
    res.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://localhost:${port}/`;
});

afterAll(() => {
  server.close();
});

describe("crawlCompanySite (integration, local fixture)", () => {
  it("fetches the homepage and follows an unconventional hiring-page link", async () => {
    const result = await crawlCompanySite(baseUrl);
    const urls = result.pages.map((p) => new URL(p.url).pathname);
    expect(urls).toContain("/");
    expect(urls).toContain("/company/work-with-us");
  });

  it("skips a page disallowed by robots.txt rather than failing the whole crawl", async () => {
    const result = await crawlCompanySite(baseUrl);
    const skippedUrls = result.skipped.map((s) => new URL(s.url).pathname);
    expect(skippedUrls).toContain("/careers/internal-notes");
    expect(result.pages.length).toBeGreaterThan(0); // rest of the crawl still succeeded
  });

  it("records an unreachable homepage as skipped instead of throwing", async () => {
    const result = await crawlCompanySite("http://localhost:1/nonexistent");
    expect(result.pages).toEqual([]);
    expect(result.skipped.length).toBe(1);
  });
});
