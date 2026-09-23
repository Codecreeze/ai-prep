export type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

// Inline script injected into <head> (see layout.tsx) — runs before paint so the
// correct theme is already applied by the time React hydrates, avoiding a
// light-then-dark flash. Kept as a plain string (not an imported function) because
// it has to run as a blocking synchronous script tag, before any React/module code.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function isDarkActive(): boolean {
  if (typeof window === "undefined") return false;
  const stored = getStoredTheme();
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
