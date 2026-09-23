type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export const TextField = ({ label, className = "", id, ...props }: TextFieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <input
      id={id}
      {...props}
      className={`rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${className}`}
    />
  </label>
);
