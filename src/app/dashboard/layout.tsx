import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";
import { KitCompletionWatcher } from "@/components/kits/KitCompletionWatcher";
import { KitCompletionModal } from "@/components/kits/KitCompletionModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Server-side auth gate: redirects before any HTML reaches a signed-out visitor,
// so there's no client-side flash of protected content (and no useEffect needed).
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex min-h-0">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col min-w-0">
        <ErrorBoundary>
          <Topbar email={user.email} />
        </ErrorBoundary>
        {/* id targeted by react-infinite-scroll-component's `scrollableTarget` — this is
            the actual scroll container (see devlog/29), not `window`, so any infinite
            list on a dashboard page needs to be told to watch this element instead of
            the page's own scroll, which never moves. */}
        <main id="dashboard-scroll-area" className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <ErrorBoundary>
        <KitCompletionWatcher />
      </ErrorBoundary>
      <ErrorBoundary>
        <KitCompletionModal />
      </ErrorBoundary>
    </div>
  );
};

export default DashboardLayout;
