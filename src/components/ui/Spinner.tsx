import { LoaderCircle } from "lucide-react";

export const Spinner = ({ className = "size-4" }: { className?: string }) => (
  <LoaderCircle className={`animate-spin ${className}`} aria-hidden="true" />
);
