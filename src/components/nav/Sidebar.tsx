"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const AnalyzeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5 shrink-0">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const KitsIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5 shrink-0">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V9zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5 shrink-0">
    <path d="M3 13a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm5-6a1 1 0 011-1h1a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm5-4a1 1 0 011-1h1a1 1 0 011 1v14a1 1 0 01-1 1h-1a1 1 0 01-1-1V3z" />
  </svg>
);

const PracticeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5 shrink-0">
    <path d="M5.5 2A1.5 1.5 0 004 3.5v13A1.5 1.5 0 005.5 18h1.75a.75.75 0 000-1.5H5.5V3.5h9v13H12.75a.75.75 0 000 1.5h1.75a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0014.5 2h-9z" />
    <path d="M8 7a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 7zm0 3a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 10zm.75 2.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/dashboard/analyze", label: "Analyze", icon: AnalyzeIcon },
  { href: "/dashboard/kits", label: "Kits", icon: KitsIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/dashboard/practice", label: "Practice", icon: PracticeIcon },
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
                  <Icon />
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
