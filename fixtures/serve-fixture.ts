import http from "node:http";

// A tiny local "company site" used to sanity-check the crawler + batch command end to
// end, mirroring exactly how Trao's own grader serves company sites (Appendix B:
// http://localhost:8099/acme/). Deliberately puts hiring info at an unconventional
// path, not /careers, to prove rankLinks() isn't just matching a hardcoded string.
const PAGES: Record<string, string> = {
  "/acme/": `<html><body>
      <h1>Acme Corp</h1>
      <p>Acme builds developer tools for distributed systems teams.</p>
      <nav><a href="about">About</a></nav>
      <a href="handbook/how-we-hire">How We Hire</a>
    </body></html>`,
  "/acme/handbook/how-we-hire": `<html><body>
      <h1>How We Hire at Acme</h1>
      <p>Our process: a take-home project, followed by a system design interview,
      then a final behavioural round with the team lead.</p>
    </body></html>`,
  "/acme/about": `<html><body><p>Acme was founded in 2019 and is fully remote.</p></body></html>`,
};

const server = http.createServer((req, res) => {
  const body = PAGES[req.url ?? ""];
  if (!body) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(body);
});

const PORT = 8099;
server.listen(PORT, () => console.log(`Fixture company site running at http://localhost:${PORT}/acme/`));
