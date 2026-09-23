"use client";

import { Pin } from "lucide-react";
import { Tooltip } from "./Tooltip";

type PinButtonProps = {
  pinned: boolean;
  onClick: () => void;
  // `inline` renders as a normal flex-flow button instead of floating at the
  // corner — for containers that aren't shaped like a padded card (e.g. a
  // left-accent list row with no reserved corner space), overlaying a
  // corner icon would sit on top of the text instead of beside it.
  inline?: boolean;
  className?: string;
};

// Pinned = red (a clear "this is fixed in place" signal); not pinned = the same
// plain muted color every other icon button uses, so it doesn't fight for
// attention before the user has actually pinned anything. The 45° tilt is the
// classic "push-pin" look (Lucide's Pin glyph is drawn upright by default) and
// stays constant in both states — only the color changes on toggle, not the
// rotation, so the icon doesn't visually flip when you click it.
export const PinButton = ({ pinned, onClick, inline = false, className = "" }: PinButtonProps) => (
  <Tooltip label={pinned ? "Unpin" : "Pin"} align="end">
    <button
      type="button"
      onClick={onClick}
      aria-label={pinned ? "Unpin" : "Pin"}
      aria-pressed={pinned}
      className={`${inline ? "" : "absolute top-2.5 right-2.5"} size-6 grid place-items-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        pinned ? "text-red-600 dark:text-red-500" : "text-muted hover:text-foreground"
      } ${className}`}
    >
      <Pin className={`size-3.5 rotate-45 ${pinned ? "fill-current" : ""}`} />
    </button>
  </Tooltip>
);
