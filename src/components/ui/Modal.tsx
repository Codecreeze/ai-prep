"use client";

import { createPortal } from "react-dom";

// Portalled to document.body rather than rendered in place: a `fixed`-positioned
// element is only truly viewport-relative if no ancestor sets `filter`/
// `backdrop-filter`/`transform`/`perspective` — any of those creates a new
// containing block for fixed descendants (CSS spec). The topbar's `backdrop-blur`
// is exactly that, so a modal triggered from inside it (e.g. UserMenu's sign-out
// confirm) would center relative to the header bar instead of the real viewport.
// Portalling sidesteps the whole ancestor-chain problem for every caller.
export const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div role="dialog" aria-modal="true" className="relative bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm p-6">
        {children}
      </div>
    </div>,
    document.body
  );
};
