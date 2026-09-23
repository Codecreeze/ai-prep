import { PracticeHub } from "@/components/practice/PracticeHub";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const PracticeHubPage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Practice</h1>
    <p className="text-sm text-muted mb-6">Jump back into flashcard practice for any kit that&apos;s ready.</p>
    <ErrorBoundary>
      <PracticeHub />
    </ErrorBoundary>
  </div>
);

export default PracticeHubPage;
