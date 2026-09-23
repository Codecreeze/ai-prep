"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Search, LayoutList, BarChart3, BookOpenCheck } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const NAV_ITEMS = [
  { href: "/dashboard/analyze", label: "Analyze", icon: Search },
  { href: "/dashboard/kits", label: "Kits", icon: LayoutList },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/practice", label: "Practice", icon: BookOpenCheck },
];

export const Sidebar = () => {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex h-full shrink-0 flex-col bg-sidebar border-r border-border transition-[width] duration-200 ${collapsed ? "md:w-16" : "md:w-60"}`}
    >
      <Link href="/dashboard/analyze" className="h-14 flex items-center gap-2 px-4 border-b border-border overflow-hidden hover:bg-background">
        <span className="size-7 rounded-lg bg-primary text-white grid place-items-center shrink-0">
          <BrainCircuit className="size-4" />
        </span>
        {!collapsed && <span className="font-semibold text-foreground text-sm truncate">Interview Prep Kit</span>}
      </Link>
      <nav className="flex-1 px-3 py-4">
        {!collapsed && <p className="text-xs font-semibold text-muted uppercase tracking-wide px-2 mb-2">General</p>}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            // "Kits" and "Practice" also stay highlighted on their [id] sub-pages
            // (/dashboard/kits/[id], /dashboard/practice/[id]); Analyze/Analytics are
            // exact matches only.
            const isActive = href === "/dashboard/kits" || href === "/dashboard/practice" ? pathname.startsWith(href) : pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={label}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium ${collapsed ? "justify-center" : ""} ${
                    isActive ? "text-foreground bg-primary-soft" : "text-muted hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {!collapsed && label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
