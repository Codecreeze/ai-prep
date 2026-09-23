import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export const RegenerateButton = ({ onClick, isLoading, label = "Regenerate" }: { onClick: () => void; isLoading: boolean; label?: string }) => (
  <Button type="button" variant="secondary" onClick={onClick} disabled={isLoading} className="!px-3 !py-1.5 text-xs">
    {isLoading && <Spinner className="size-3.5" />}
    {isLoading ? "Regenerating..." : label}
  </Button>
);
