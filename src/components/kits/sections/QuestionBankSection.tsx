"use client";

import type { Kit, Question } from "@/server/validation/kitSchema";
import type { KitEditState } from "@/server/builder/editState";
import { useRegenerateQuestionsCategoryMutation, useReorderQuestionsMutation } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "./SectionHeading";
import { QuestionItem } from "./QuestionItem";
import { AddQuestionForm } from "./AddQuestionForm";
import { RegenerateButton } from "./RegenerateButton";

const groupByCategory = (questions: Question[]) =>
  questions.reduce<Record<string, Question[]>>((groups, q) => {
    (groups[q.category] ??= []).push(q);
    return groups;
  }, {});

const CategoryGroup = ({
  kitId,
  category,
  questions,
  editState,
  requirements,
}: {
  kitId: string;
  category: Question["category"];
  questions: Question[];
  editState: KitEditState;
  requirements: Kit["role"]["requirements"];
}) => {
  const [regenerate, { isLoading }] = useRegenerateQuestionsCategoryMutation();
  const [reorderQuestions] = useReorderQuestionsMutation();

  const moveTo = (fromIndex: number, toIndex: number) => {
    const orderedIds = questions.map((q) => q.id);
    [orderedIds[fromIndex], orderedIds[toIndex]] = [orderedIds[toIndex], orderedIds[fromIndex]];
    reorderQuestions({ id: kitId, category, orderedIds });
  };

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">{category.replace("-", " ")}</h3>
        <RegenerateButton onClick={() => regenerate({ id: kitId, category })} isLoading={isLoading} />
      </div>
      <ul className="flex flex-col gap-4 mb-3">
        {questions.map((q, i) => (
          <QuestionItem
            key={q.id}
            kitId={kitId}
            question={q}
            editState={editState.questions[q.id]}
            canMoveUp={i > 0}
            canMoveDown={i < questions.length - 1}
            onMoveUp={() => moveTo(i, i - 1)}
            onMoveDown={() => moveTo(i, i + 1)}
          />
        ))}
      </ul>
      <AddQuestionForm kitId={kitId} category={category} requirements={requirements} />
    </div>
  );
};

const ALL_CATEGORIES: Question["category"][] = ["technical", "behavioural", "system-design", "company-fit"];

export const QuestionBankSection = ({
  kitId,
  questions,
  coverage,
  editState,
  requirements,
}: {
  kitId: string;
  questions: Kit["questions"];
  coverage: Kit["coverage"];
  editState: KitEditState;
  requirements: Kit["role"]["requirements"];
}) => {
  const groups = groupByCategory(questions);
  const fullyCovered = coverage.uncovered_requirement_ids.length === 0;
  const presentCategories = ALL_CATEGORIES.filter((c) => groups[c]?.length);

  return (
    <Card className="p-6 mb-6">
      <SectionHeading
        action={
          <Badge tone={fullyCovered ? "success" : "warning"}>
            {fullyCovered ? "Fully covered" : `${coverage.uncovered_requirement_ids.length} uncovered`}
          </Badge>
        }
      >
        Question bank
      </SectionHeading>
      {presentCategories.map((category) => (
        <CategoryGroup
          key={category}
          kitId={kitId}
          category={category}
          questions={groups[category]}
          editState={editState}
          requirements={requirements}
        />
      ))}
    </Card>
  );
};
