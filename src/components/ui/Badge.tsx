type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

export const Badge = ({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) => (
  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${TONE_CLASSES[tone]}`}>
    {children}
  </span>
);
