import type { KitDetail } from "@/lib/api/kitsApi";
import { Spinner } from "@/components/ui/Spinner";

export const KitProgressBanner = ({ status }: { status: KitDetail["status"] }) => {
  if (status === "ready") return null;

  const isFailed = status === "failed";
  return (
    <div
      role="status"
      className={`rounded-xl border p-5 mb-6 flex items-center gap-3 ${
        isFailed
          ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400"
          : "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/20 dark:border-teal-900/40 dark:text-teal-300"
      }`}
    >
      {!isFailed && <Spinner className="size-5 shrink-0" />}
      <p className="text-sm font-medium">
        {isFailed
          ? "Generation failed. Try creating the kit again."
          : "Researching the company and generating your kit — this can take a couple of minutes."}
      </p>
    </div>
  );
};
