# React / Frontend Rules (STRICT)

1. **Avoid `useEffect` and `useRef` unless there is genuinely no alternative.**
   - Prefer deriving state during render over syncing it in an effect.
   - Prefer event handlers over effects for anything triggered by user action.
   - Valid uses of `useEffect`: subscribing to a truly external system (WebSocket,
     browser API, third-party non-React library) — nothing else.
   - Valid uses of `useRef`: DOM node access for imperative APIs (focus, measuring),
     never as a substitute for state.
   - If you reach for either, write a one-line comment justifying why no alternative
     exists.
2. **One component per file.** If a piece of UI needs more than one component, split
   into separate files — no multi-component files "for convenience."
3. **Components are arrow functions.** `const Foo = () => {...}` exported from their
   own file, not `function Foo()`.
4. **Components stay short.** If a component's JSX + logic is sprawling, extract
   sub-components or hooks rather than growing one file. No hard line count, but if
   you're scrolling to understand one component, it's too big.
5. **Comments are one-liners only.** No multi-line comment blocks, no restating what
   the code already says. A comment explains WHY (a non-obvious constraint or
   trade-off), not WHAT.
6. **No prop drilling beyond 3 levels.** Past that, use the chosen state management
   tool (see Rules/02-state-management.md) instead of threading props further down.
7. **No unnecessary client components.** Default to Server Components; add
   `"use client"` only where interactivity genuinely requires it.
8. **Styling:** Tailwind utility classes, no inline style objects unless dynamic
   values genuinely require it.
9. **Accessibility is not optional:** every interactive element must be keyboard
   reachable and have a visible focus state.
