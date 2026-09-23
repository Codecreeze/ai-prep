"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, X } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

const NAV_ITEMS = [
  { href: "/dashboard/analyze", label: "Analyze" },
  { href: "/dashboard/kits", label: "Kits" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/practice", label: "Practice" },
];

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
          <Search className="size-5 text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <button type="button" aria-label="Close" title="Close" onClick={onClose} className="text-muted hover:text-foreground">
            <X className="size-5" />
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
                <ArrowRight className="size-4 text-muted shrink-0" />
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
