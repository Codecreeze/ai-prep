import { CreateKitForm } from "@/components/kits/CreateKitForm";
import { RecentKitsList } from "@/components/kits/RecentKitsList";

const AnalyzePage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Analyze</h1>
    <p className="text-sm text-muted mb-6">Paste a job description and a company site to generate a new prep kit.</p>
    <CreateKitForm />
    <RecentKitsList />
  </div>
);

export default AnalyzePage;
