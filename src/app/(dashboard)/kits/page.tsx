import { CreateKitForm } from "@/components/kits/CreateKitForm";
import { KitList } from "@/components/kits/KitList";

const KitsPage = () => (
  <div>
    <CreateKitForm />
    <h2 className="font-semibold text-foreground mb-3">Your kits</h2>
    <KitList />
  </div>
);

export default KitsPage;
