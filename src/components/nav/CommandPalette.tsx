"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";

const NAV_ITEMS = [
  { href: "/dashboard/analyze", label: "Analyze" },
  { href: "/dashboard/kits", label: "Kits" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/practice", label: "Practice" },
];

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-muted shrink-0">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-muted shrink-0">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.29 5.15a.75.75 0 111.02-1.1l5.5 5a.75.75 0 010 1.1l-5.5 5a.75.75 0 11-1.02-1.1l4.098-4.1H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
);

export const CommandPalette = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const matches = NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(debouncedQuery.trim().toLowerCase()));

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center pt-24 px-4">
      <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div role="dialog" aria-modal="true" className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg h-fit overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <SearchIcon />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <button type="button" aria-label="Close" title="Close" onClick={onClose} className="text-muted hover:text-foreground">
            <CloseIcon />
          </button>
        </div>
        <div className="py-2 max-h-80 overflow-y-auto">
          <p className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide">General</p>
          {matches.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No matches.</p>
          ) : (
            matches.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background text-left"
              >
                <ArrowIcon />
                {item.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
