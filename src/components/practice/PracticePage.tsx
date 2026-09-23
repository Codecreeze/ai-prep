"use client";

import Link from "next/link";
import { useGetKitQuery } from "@/lib/api/kitsApi";
import { useGetNextSessionQuery } from "@/lib/api/practiceApi";
import { PracticeCoverageBar } from "./PracticeCoverageBar";
import { ReadinessScoreCard } from "./ReadinessScoreCard";
import { PracticeSessionRunner } from "./PracticeSessionRunner";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorText } from "@/components/ui/ErrorText";

export const PracticePage = ({ kitId }: { kitId: string }) => {
  const { data, isLoading, isError } = useGetNextSessionQuery(kitId);
  // RTK Query dedupes this against the kit-detail page's own fetch of the same
  // query key, so navigating here from the kit page costs no extra request.
  const { data: kitData } = useGetKitQuery(kitId);
  const role = kitData?.kit.kit?.source?.role;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/dashboard/kits/${kitId}`} className="text-sm text-primary hover:underline mb-2 inline-block">← Back to kit</Link>
        <h1 className="text-2xl font-semibold text-foreground">Practice{role ? ` — ${role}` : ""}</h1>
        <p className="text-sm text-muted mt-1">Flashcard drills weighted toward what you&apos;re least confident about.</p>
      </div>

      {isLoading ? (
        <LoadingState className="min-h-[50vh]" />
      ) : isError ? (
        <ErrorText>Couldn&apos;t load flashcards for this kit.</ErrorText>
      ) : (
        // Single full-width column, stacked — matches every other dashboard page
        // instead of splitting into a sidebar layout.
        <div className="flex flex-col gap-6">
          {kitData?.kit.kit && <ReadinessScoreCard kitId={kitId} requirements={kitData.kit.kit.role.requirements} />}
          <PracticeCoverageBar kitId={kitId} />
          {data && <PracticeSessionRunner kitId={kitId} initialFlashcards={data.flashcards} />}
        </div>
      )}
    </div>
  );
};
