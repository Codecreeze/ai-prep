import { useEffect, useState } from "react";

// One of the few legitimate useEffect cases in this codebase (Rules/01): a debounce
// genuinely needs a timer tied to the component lifecycle (cancel the pending timeout
// on unmount/value-change), which isn't expressible as a pure render-time derivation.
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
