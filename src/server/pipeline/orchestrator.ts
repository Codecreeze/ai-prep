import { extractRequirements } from "../extraction/extractRequirements";
import { crawlCompanySite } from "../crawler/crawlCompanySite";
import { searchPublicDiscussion } from "../search/searchPublicDiscussion";
import { generateBrief } from "../generation/generateBrief";
import { generateQuestionsFor, createQuestionIdGenerator } from "../generation/generateQuestions";
import { categoriesFor } from "../generation/categoryRouter";
import { generateFlashcards } from "../generation/generateFlashcards";
import { checkCoverage } from "../coverage/checkCoverage";
import { buildSchedule } from "../scheduler/buildSchedule";
import { validateKit, type Kit, type Question, type Requirement } from "../validation/kitSchema";

const MAX_COVERAGE_PASSES = 2; // see docs/PIPELINE_DESIGN.md §4 for the stop-condition rationale

function companyNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "the company";
  }
}

// Second-pass generation for a still-uncovered requirement uses its own primary
// category rather than the full categoriesFor() set, to avoid re-asking for
// categories that already exist for that requirement — only the gap itself is filled.
function primaryCategoryFor(requirement: Requirement): Question["category"] {
  return categoriesFor(requirement)[0];
}

export type PipelineInput = { jd: string; companyUrl: string; days: number };

/**
 * Runs the full research + generation pipeline end to end, in the sequence the brief
 * describes: extract -> crawl -> search -> brief -> questions (per requirement x
 * category) -> flashcards -> deterministic coverage check -> second pass on gaps ->
 * deterministic schedule -> validate. This is THE single source of truth — both the
 * web app's kit-creation API route and the batch `evaluate` script call this function,
 * never a parallel reimplementation.
 */
export async function runPipeline(input: PipelineInput): Promise<Kit> {
  const { jd, companyUrl, days } = input;

  const [extracted, crawl] = await Promise.all([
    extractRequirements(jd),
    crawlCompanySite(companyUrl),
  ]);
  const discussion = await searchPublicDiscussion(companyNameFromUrl(companyUrl));

  const brief = await generateBrief(crawl.pages, discussion);

  const nextQuestionId = createQuestionIdGenerator();
  const questionBatches = await Promise.all(
    extracted.requirements.flatMap((req) =>
      categoriesFor(req).map((category) => generateQuestionsFor(req, category, nextQuestionId))
    )
  );
  let questions: Question[] = questionBatches.flat();

  let passes = 1;
  for (let pass = 1; pass < MAX_COVERAGE_PASSES; pass++) {
    const gaps = checkCoverage(extracted.requirements, questions);
    if (gaps.length === 0) break;
    passes++;
    const gapRequirements = extracted.requirements.filter((r) => gaps.includes(r.id));
    const fillBatches = await Promise.all(
      gapRequirements.map((req) => generateQuestionsFor(req, primaryCategoryFor(req), nextQuestionId))
    );
    questions = [...questions, ...fillBatches.flat()];
  }
  const uncoveredAfterPasses = checkCoverage(extracted.requirements, questions);

  const flashcards = await generateFlashcards(questions);
  const schedule = buildSchedule(extracted.requirements, questions, days);

  const kit: Kit = {
    source: {
      company: companyNameFromUrl(companyUrl),
      company_url: companyUrl,
      role: extracted.title,
      location: "",
      jd_chars: jd.length,
      researched_at: new Date().toISOString(),
      pages_used: crawl.pages.map((p) => p.url),
    },
    company_brief: brief,
    role: {
      title: extracted.title,
      seniority: extracted.seniority,
      responsibilities: extracted.responsibilities,
      requirements: extracted.requirements,
    },
    questions,
    flashcards,
    schedule,
    coverage: { uncovered_requirement_ids: uncoveredAfterPasses, passes },
  };

  const validated = validateKit(kit);
  if (!validated.ok) throw new Error(`INVALID_KIT: ${validated.errors.join("; ")}`);
  return validated.kit;
}
