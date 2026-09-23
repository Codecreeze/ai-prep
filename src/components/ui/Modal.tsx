"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Portalled to document.body rather than rendered in place: a `fixed`-positioned
// element is only truly viewport-relative if no ancestor sets `filter`/
// `backdrop-filter`/`transform`/`perspective` — any of those creates a new
// containing block for fixed descendants (CSS spec). The topbar's `backdrop-blur`
// is exactly that, so a modal triggered from inside it (e.g. UserMenu's sign-out
// confirm) would center relative to the header bar instead of the real viewport.
// Portalling sidesteps the whole ancestor-chain problem for every caller.
export const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Subscribing to keyboard events and managing DOM focus are both external-system
  // concerns (Rules/01's legitimate useEffect case) — not something derivable from
  // props/state. Handles three keyboard-accessibility requirements together: Escape
  // closes the dialog, Tab is trapped inside it while open, and focus returns to
  // whatever triggered the dialog once it closes.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm p-6 focus:outline-none"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
