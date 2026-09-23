import { PracticePage } from "@/components/practice/PracticePage";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

type Params = { params: Promise<{ id: string }> };

const KitPracticePage = async ({ params }: Params) => {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <PracticePage kitId={id} />
    </ErrorBoundary>
  );
};

export default KitPracticePage;
