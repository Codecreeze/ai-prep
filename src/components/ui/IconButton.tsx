type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

// Text-labelled small action buttons (Edit/Delete/Pin) — deliberately not icon-only,
// so every action is understandable without relying on an icon's meaning (and stays
// screen-reader friendly without extra aria-label plumbing).
export const IconButton = ({ label, className = "", ...props }: IconButtonProps) => (
  <button
    {...props}
    aria-label={label}
    title={label}
    className={`text-xs font-medium text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-0.5 ${className}`}
  >
    {label}
  </button>
);
