type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20",
  secondary: "bg-surface text-foreground border border-border hover:bg-background",
  ghost: "text-muted hover:text-foreground hover:bg-background",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${VARIANT_CLASSES[variant]} ${className}`}
  />
);
