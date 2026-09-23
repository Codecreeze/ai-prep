const LABELS = ["Not at all", "Barely", "Somewhat", "Confident", "Very confident"];

export const ConfidenceButtons = ({ onAnswer }: { onAnswer: (confidence: number) => void }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-muted">How confident did you feel?</p>
    <div className="flex gap-1.5">
      {LABELS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onAnswer(i + 1)}
          title={label}
          className="flex-1 text-xs font-medium border border-border rounded-lg py-2 hover:bg-background hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {i + 1}
        </button>
      ))}
    </div>
  </div>
);
