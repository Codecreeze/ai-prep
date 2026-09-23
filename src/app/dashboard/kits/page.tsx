import { KitsTable } from "@/components/kits/KitsTable";

const AllKitsPage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Kits</h1>
    <p className="text-sm text-muted mb-6">Every interview prep kit you&apos;ve generated.</p>
    <KitsTable />
  </div>
);

export default AllKitsPage;
