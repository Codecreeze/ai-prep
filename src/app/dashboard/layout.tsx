import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";
import { KitCompletionWatcher } from "@/components/kits/KitCompletionWatcher";
import { KitCompletionModal } from "@/components/kits/KitCompletionModal";

// Server-side auth gate: redirects before any HTML reaches a signed-out visitor,
// so there's no client-side flash of protected content (and no useEffect needed).
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex min-h-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar email={user.email} />
        <main className="flex-1 min-h-0 overflow-y-auto px-5 py-6">{children}</main>
      </div>
      <KitCompletionWatcher />
      <KitCompletionModal />
    </div>
  );
};

export default DashboardLayout;
