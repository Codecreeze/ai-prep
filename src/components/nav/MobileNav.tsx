"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Menu } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/analyze", label: "Analyze" },
  { href: "/dashboard/kits", label: "Kits" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/practice", label: "Practice" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        title="Open navigation menu"
        className="size-8 grid place-items-center rounded-lg text-muted hover:text-foreground hover:bg-background"
      >
        <Menu className="size-5" />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 animate-[fadeIn_150ms_ease-out]"
          />
          {/* A real drawer, not a flat panel: shadow for elevation, slides in from the
              left rather than just appearing — portalled to <body> so it's never
              confined by an ancestor's backdrop-blur containing block (see Modal.tsx
              for the same underlying CSS issue). */}
          <div className="relative w-64 bg-sidebar h-full flex flex-col shadow-2xl animate-[slideIn_180ms_ease-out]">
            <Link
              href="/dashboard/analyze"
              onClick={() => setOpen(false)}
              className="h-14 flex items-center gap-2 px-4 border-b border-border hover:bg-background"
            >
              <span className="size-7 rounded-lg bg-primary text-white grid place-items-center shrink-0">
                <BrainCircuit className="size-4" />
              </span>
              <span className="font-semibold text-foreground text-sm">Interview Prep Kit</span>
            </Link>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label }) => {
                // Same active-route rule as the desktop Sidebar: Kits and Practice also
                // stay highlighted on their /:id sub-pages, the others are exact matches.
                const isActive =
                  href === "/dashboard/kits" || href === "/dashboard/practice" ? pathname.startsWith(href) : pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "text-foreground bg-primary-soft" : "text-foreground hover:bg-background"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
