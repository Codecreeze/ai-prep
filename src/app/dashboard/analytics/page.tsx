import { KitStatsCards } from "@/components/kits/KitStatsCards";
import { KitsStatusChart } from "@/components/kits/KitsStatusChart";
import { RecentKitsList } from "@/components/kits/RecentKitsList";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const AnalyticsPage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Analytics</h1>
    <p className="text-sm text-muted mb-6">How your prep kits are progressing.</p>
    <ErrorBoundary>
      <KitStatsCards />
    </ErrorBoundary>
    <div className="grid lg:grid-cols-2 gap-6">
      <ErrorBoundary>
        <KitsStatusChart />
      </ErrorBoundary>
      <ErrorBoundary>
        <RecentKitsList />
      </ErrorBoundary>
    </div>
  </div>
);

export default AnalyticsPage;
