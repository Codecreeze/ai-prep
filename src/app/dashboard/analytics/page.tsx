import { KitStatsCards } from "@/components/kits/KitStatsCards";
import { KitsStatusChart } from "@/components/kits/KitsStatusChart";
import { RecentKitsList } from "@/components/kits/RecentKitsList";

const AnalyticsPage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Analytics</h1>
    <p className="text-sm text-muted mb-6">How your prep kits are progressing.</p>
    <KitStatsCards />
    <div className="grid lg:grid-cols-2 gap-6">
      <KitsStatusChart />
      <RecentKitsList />
    </div>
  </div>
);

export default AnalyticsPage;
