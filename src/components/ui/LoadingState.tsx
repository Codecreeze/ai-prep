import { Spinner } from "./Spinner";

// The shared "this section's data hasn't arrived yet" state — icon only, no text
// (a bare spinner reads as loading on its own; repeating "Loading X..." next to it
// added noise without adding information). Centered in whatever box it's placed in,
// with enough vertical room (`py-20`) that it never reads as pinned to one corner.
export const LoadingState = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center py-20 ${className}`}>
    <Spinner className="size-8 text-muted" />
  </div>
);
