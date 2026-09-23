const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-muted shrink-0">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

// Local to the Kits list page (not the global topbar command palette) — filters and
// paginates server-side via KitsTable's debounced query, so it works correctly
// across the full result set, not just whatever page is currently loaded.
export const KitsSearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-primary max-w-sm">
    <SearchIcon />
    <span className="sr-only">Search kits</span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by role or company..."
      className="bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none w-full"
    />
  </label>
);
