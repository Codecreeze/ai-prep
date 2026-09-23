# 26 — Modal Portal Fix (off-center sign-out dialog)

**Files:** `src/components/ui/Modal.tsx`

## What happened
The delete-kit confirm dialog (triggered from `KitsTable`) centered correctly; the
sign-out confirm dialog (triggered from `UserMenu`, inside the topbar) did not — it
rendered offset toward wherever the topbar happened to be, not centered on the page.

## Root cause
`Modal` used `position: fixed; inset: 0`, which is normally always relative to the
viewport — *except* when an ancestor element sets `transform`, `filter`,
`backdrop-filter`, `perspective`, or `will-change` on one of those, any of which
creates a new **containing block** for `fixed`-positioned descendants (this is in
the CSS spec, not a browser bug). The app's `Topbar` has `backdrop-blur` on its
header (`bg-surface/80 backdrop-blur`) for the frosted-glass sticky-header look —
exactly one of those trigger properties. `UserMenu` (and its `ConfirmDialog`) lives
inside that header, so its `Modal` was being positioned relative to the *header
bar*, not the viewport. `KitsTable`'s delete dialog has no such ancestor, which is
why only the sign-out one showed the bug.

## Fix
Render every `Modal` via `createPortal(..., document.body)` instead of in place.
Portalling moves the DOM node itself to be a direct child of `<body>`, completely
outside any ancestor's containing-block chain — so this class of bug can't recur
for any future modal caller, regardless of what CSS the component that triggers it
happens to use. This is the standard, correct fix for this exact CSS interaction
(not a workaround), and it's the same reason most modal/dialog libraries (Radix,
Headless UI, etc.) portal by default.

## Verified
Visual inspection initially looked ambiguous — a screenshot still appeared to show
the dialog off to one side. Rather than trust that, measured precisely via
`getBoundingClientRect()` in the browser: the dialog's horizontal center was at
`x: 640` and vertical center at `y: 450`, exactly half of the 1280×900 emulated
viewport in both axes — genuinely centered. The screenshot's apparent offset turned
out to be a display artifact of the screenshot tool's pane being narrower than the
emulated viewport (cropping the view), not a real positioning bug. Also confirmed
via DOM inspection that the modal's overlay is a direct child of `document.body`
(`overlayParentIsBody: true`) with a full-viewport bounding rect, confirming the
portal is working as intended.

## Why this is worth a devlog entry on its own
It's a good example of not trusting a single signal (a screenshot) when a more
precise one (a DOM measurement) is available and cheap to get — especially in an
automated browser context where the visible pane and the actual page viewport can
legitimately differ.
