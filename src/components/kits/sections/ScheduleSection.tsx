"use client";

import type { Kit } from "@/server/validation/kitSchema";
import { useRegenerateScheduleMutation } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "./SectionHeading";
import { RegenerateButton } from "./RegenerateButton";

export const ScheduleSection = ({ kitId, schedule }: { kitId: string; schedule: Kit["schedule"] }) => {
  const [regenerateSchedule, { isLoading }] = useRegenerateScheduleMutation();

  return (
    <Card className="p-6">
      <SectionHeading action={<RegenerateButton onClick={() => regenerateSchedule(kitId)} isLoading={isLoading} />}>
        Study schedule ({schedule.days_available} day{schedule.days_available !== 1 ? "s" : ""})
      </SectionHeading>
      <ol className="flex flex-col gap-3">
        {schedule.days.map((day) => (
          <li key={day.day} className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-4">
            <span className="font-semibold text-foreground shrink-0">Day {day.day}</span>
            <span className="text-muted flex-1">
              {day.focus}
              <span className="block text-xs mt-0.5">
                {day.minutes} min · {day.question_ids.length} question{day.question_ids.length !== 1 ? "s" : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
};
