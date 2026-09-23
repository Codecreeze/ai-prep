import { PracticePage } from "@/components/practice/PracticePage";

type Params = { params: Promise<{ id: string }> };

const KitPracticePage = async ({ params }: Params) => {
  const { id } = await params;
  return <PracticePage kitId={id} />;
};

export default KitPracticePage;
