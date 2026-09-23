"use client";

import { Toaster } from "sonner";

// Styled via inline CSS-variable references to our own design tokens (globals.css)
// rather than Sonner's own theme prop — this way light/dark just works automatically
// whenever [data-theme] flips, with zero JS-side sync needed between our theme
// toggle and Sonner's.
export const AppToaster = () => (
  <Toaster
    position="top-center"
    richColors={false}
    closeButton
    duration={2000}
    toastOptions={{
      style: {
        background: "var(--surface)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.25)",
      },
      classNames: {
        closeButton: "!bg-surface !border-border !text-muted hover:!text-foreground",
      },
    }}
  />
);
