import { CreateKitForm } from "@/components/kits/CreateKitForm";
import { BatchUploadForm } from "@/components/kits/BatchUploadForm";
import { RecentKitsList } from "@/components/kits/RecentKitsList";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const AnalyzePage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Analyze</h1>
    <p className="text-sm text-muted mb-6">Paste a job description and a company site to generate a new prep kit.</p>
    <ErrorBoundary>
      <CreateKitForm />
    </ErrorBoundary>
    <ErrorBoundary>
      <BatchUploadForm />
    </ErrorBoundary>
    <ErrorBoundary>
      <RecentKitsList />
    </ErrorBoundary>
  </div>
);

export default AnalyzePage;
