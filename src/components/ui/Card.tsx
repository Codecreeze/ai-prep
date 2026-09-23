export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={`bg-surface border border-border rounded-xl shadow-sm shadow-slate-900/5 ${className}`}
  />
);
