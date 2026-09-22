# State Management Rules

1. **Local, single-component state** → `useState`. Don't reach for global state for
   something only one component cares about.
2. **Shared state used by >3 levels of the component tree, or shared across routes**
   (e.g. current kit being edited, its edit/generated/pinned map, practice session
   progress, UI toggles) → a **Redux Toolkit slice** (`createSlice`), read via typed
   `useAppSelector`/`useAppDispatch` hooks.
3. **Server state** (kits list, kit detail, anything that lives in MongoDB) →
   **RTK Query** (`createApi`), not `useEffect` + `fetch`. RTK Query gives caching,
   loading/error states, and tag-based cache invalidation out of the box — directly
   serving the brief's "clear loading, empty and error states" requirement, and its
   tag invalidation is a good fit for "regenerate one section without clobbering
   others": each section's query tag is invalidated independently.
   - **One library, one store:** RTK Query lives inside the same Redux store as the
     client-state slices (Redux Toolkit's own recommended pattern) — no second state
     library, no two different mental models to explain. This replaced an earlier
     Zustand + TanStack Query split; one `@reduxjs/toolkit` dependency covers both
     jobs, which is more DRY and matches the project's default stack.
4. **Form state** stays local (`useState` per field or a small form) unless a form
   grows complex enough to justify a form library — cross that bridge only if it's
   actually needed (YAGNI).
5. Never duplicate RTK Query cache data into a plain slice "just in case." Slices hold
   client-only/UI state (open panels, drag state, edit-mode toggles, optimistic edit
   buffers); RTK Query owns anything that came from the server.
