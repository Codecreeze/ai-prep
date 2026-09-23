import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { LogoutButton } from "@/components/nav/LogoutButton";

// Server-side auth gate: redirects before any HTML reaches a signed-out visitor,
// so there's no client-side flash of protected content (and no useEffect needed).
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/kits" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="size-7 rounded-lg bg-primary text-white grid place-items-center text-sm">AI</span>
            <span className="hidden sm:inline">Interview Prep Kit</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
