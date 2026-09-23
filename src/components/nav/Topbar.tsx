import { SidebarToggle } from "./SidebarToggle";
import { MobileNav } from "./MobileNav";
import { CommandPaletteTrigger } from "./CommandPaletteTrigger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "./UserMenu";

export const Topbar = ({ email }: { email: string }) => (
  <header className="h-14 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
    <SidebarToggle />
    <MobileNav />
    <CommandPaletteTrigger />
    <div className="flex-1" />
    <ThemeToggle />
    <UserMenu email={email} />
  </header>
);
