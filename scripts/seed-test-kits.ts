// Throwaway dev script: seeds N ready kits directly into MongoDB (bypassing the LLM
// pipeline entirely) so pagination can be tested without waiting on 13 real
// generations. Minimal but schema-valid kit content — not for grading, just local
// UI testing. Run: npx tsx scripts/seed-test-kits.ts <email> <count>
import "dotenv/config";
import { connectDb } from "../src/server/persistence/db";
import { Kit } from "../src/server/persistence/models/Kit";
import { User } from "../src/server/persistence/models/User";
import { computeDedupeHash } from "../src/server/persistence/dedupeHash";
import { emptyEditState } from "../src/server/builder/editState";
import type { Kit as KitContent } from "../src/server/validation/kitSchema";

const ROLES = [
  "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "DevOps Engineer",
  "Data Engineer", "Site Reliability Engineer", "Mobile Engineer", "QA Engineer",
  "Platform Engineer", "Security Engineer", "Engineering Manager", "Product Engineer",
  "Machine Learning Engineer",
];
const COMPANIES = ["Acme", "Globex", "Initech", "Umbrella", "Stark Industries"];

function makeKit(role: string, company: string): KitContent {
  return {
    source: {
      company, company_url: `https://${company.toLowerCase()}.example.com`, role,
      location: "Remote", jd_chars: 200, researched_at: new Date().toISOString(), pages_used: [],
    },
    company_brief: { summary: `${company} is a seeded test company.`, what_they_do: "Testing pagination.", sources: [] },
    role: {
      title: role, seniority: "Mid-Level", responsibilities: ["Ship features"],
      requirements: [{ id: "r1", text: "3+ years relevant experience", kind: "technical", priority: "must" }],
    },
    questions: [{ id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "Sample question", answer_outline: "Sample answer", difficulty: 1 }],
    flashcards: [{ id: "f1", front: "Sample front", back: "Sample back", requirement_ids: ["r1"] }],
    schedule: { days_available: 3, days: [{ day: 1, focus: role, question_ids: ["q1"], minutes: 15 }, { day: 2, focus: "Review", question_ids: [], minutes: 0 }, { day: 3, focus: "Review", question_ids: [], minutes: 0 }] },
    coverage: { uncovered_requirement_ids: [], passes: 1 },
  };
}

async function main() {
  const email = process.argv[2];
  const count = Number(process.argv[3] ?? 13);
  if (!email) throw new Error("Usage: npx tsx scripts/seed-test-kits.ts <email> <count>");

  await connectDb();
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No user found with email ${email}`);

  for (let i = 0; i < count; i++) {
    const role = ROLES[i % ROLES.length];
    const company = COMPANIES[i % COMPANIES.length];
    const jd = `${role} at ${company} (seed #${i})`;
    const companyUrl = `https://${company.toLowerCase()}.example.com`;
    await Kit.create({
      userId: user._id,
      status: "ready",
      input: { jd, companyUrl, days: 3 },
      dedupeHash: computeDedupeHash(jd, companyUrl),
      kit: makeKit(role, company),
      editState: emptyEditState(),
      createdAt: new Date(Date.now() - i * 60_000), // stagger timestamps so sort order is meaningful
    });
  }
  console.log(`Seeded ${count} kits for ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
