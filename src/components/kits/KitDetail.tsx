"use client";

import { useGetKitQuery } from "@/lib/api/kitsApi";
import { emptyEditState } from "@/server/builder/editState";
import { KitDetailHeader } from "./KitDetailHeader";
import { KitProgressBanner } from "./KitProgressBanner";
import { CompanyBriefSection } from "./sections/CompanyBriefSection";
import { RoleSection } from "./sections/RoleSection";
import { QuestionBankSection } from "./sections/QuestionBankSection";
import { FlashcardsSection } from "./sections/FlashcardsSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorText } from "@/components/ui/ErrorText";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const KitDetail = ({ id }: { id: string }) => {
  // Static interval, single subscription — the simplest reliable RTK Query polling
  // form. A conditional two-subscription variant (stop once ready) was tried first
  // but silently never triggered a refetch; `skipPollingIfUnfocused` was also tried
  // and silently disabled polling entirely in the test browser (it treats the tab as
  // backgrounded). This plain static-interval version is the one verified (via
  // network logs) to actually poll reliably — see devlog/12. It keeps polling after
  // "ready" too (a known, documented minor inefficiency, not a correctness issue —
  // Builder edits use their own mutations/cache invalidation, unaffected by this).
  const { data, isLoading, isError } = useGetKitQuery(id, { pollingInterval: 4000 });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorText>Couldn&apos;t load this kit.</ErrorText>;

  const { status, kit, editState } = data.kit;
  // Deep-merged, not just `editState ?? emptyEditState()` — a kit created before the
  // editState-defaults fix (see devlog) can have a partial object (e.g. missing
  // `questions`/`flashcards` entirely), which would otherwise crash every question/
  // flashcard render trying to read `editState.questions[id]` on undefined.
  const resolvedEditState = { ...emptyEditState(), ...editState };

  return (
    <div>
      <KitDetailHeader kitId={id} status={status} source={kit?.source} />
      <KitProgressBanner status={status} />
      {kit && (
        <>
          <ErrorBoundary>
            <CompanyBriefSection kitId={id} source={kit.source} brief={kit.company_brief} editState={resolvedEditState.brief} />
          </ErrorBoundary>
          <ErrorBoundary>
            <RoleSection role={kit.role} />
          </ErrorBoundary>
          <ErrorBoundary>
            <QuestionBankSection
              kitId={id}
              questions={kit.questions}
              coverage={kit.coverage}
              editState={resolvedEditState}
              requirements={kit.role.requirements}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <FlashcardsSection kitId={id} flashcards={kit.flashcards} editState={resolvedEditState} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ScheduleSection kitId={id} schedule={kit.schedule} />
          </ErrorBoundary>
        </>
      )}
    </div>
  );
};
