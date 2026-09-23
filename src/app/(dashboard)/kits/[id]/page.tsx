import { KitDetail } from "@/components/kits/KitDetail";

type Params = { params: Promise<{ id: string }> };

const KitDetailPage = async ({ params }: Params) => {
  const { id } = await params;
  return <KitDetail id={id} />;
};

export default KitDetailPage;
