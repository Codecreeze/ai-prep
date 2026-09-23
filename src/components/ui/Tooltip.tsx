type TooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  align?: "center" | "end";
};

const SIDE_CLASS = { top: "bottom-full mb-2", bottom: "top-full mt-2" } as const;
const ALIGN_CLASS = { center: "left-1/2 -translate-x-1/2", end: "right-0" } as const;
const ARROW_SIDE_CLASS = { top: "top-full border-t-slate-900", bottom: "bottom-full border-b-slate-900" } as const;
const ARROW_ALIGN_CLASS = { center: "left-1/2 -translate-x-1/2", end: "right-2.5" } as const;

// CSS-only (group-hover/focus-within), not a portal or JS-positioned library — a
// tooltip anchored `absolute` to its own trigger never hits the fixed-position
// containing-block issue Modal/MobileNav had (see devlog/26), since it isn't
// `position: fixed`. No dependency needed for something this self-contained.
//
// `side`/`align` default to "bottom"/"center" (label opens below, centered under the
// trigger) — right for most buttons, but a trigger flush against the top or right edge
// of the viewport (header icons, the account avatar, a table row's kebab menu) needs
// `side="bottom" align="end"` explicitly passed by the caller so the label never opens
// above the visible header or bleeds past the right edge of the page.
export const Tooltip = ({ label, children, side = "bottom", align = "center" }: TooltipProps) => (
  <span className="relative inline-flex group/tooltip">
    {children}
    <span
      role="tooltip"
      className={`pointer-events-none absolute whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 scale-95 transition-all duration-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100 z-50 shadow-lg ${SIDE_CLASS[side]} ${ALIGN_CLASS[align]}`}
    >
      {label}
      <span className={`absolute border-4 border-transparent ${ARROW_SIDE_CLASS[side]} ${ARROW_ALIGN_CLASS[align]}`} />
    </span>
  </span>
);
