import { KitDetail } from "@/components/kits/KitDetail";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

type Params = { params: Promise<{ id: string }> };

const KitDetailPage = async ({ params }: Params) => {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <KitDetail id={id} />
    </ErrorBoundary>
  );
};

export default KitDetailPage;
