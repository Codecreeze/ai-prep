"use client";

import { Component, type ReactNode } from "react";

const DEFAULT_FALLBACK = (
  <p role="alert" className="text-sm text-muted text-center py-4">Whoops! Something went wrong.</p>
);

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

// Must be a class component — React has no hook equivalent for
// getDerivedStateFromError/componentDidCatch. Kept deliberately minimal (one line,
// no retry/reset UI, no error detail shown to the user): this exists to stop one
// broken subtree from taking down the rest of the page, not to be a full crash
// reporter. Wrap it around any component (or, for a list, around each item
// individually) so a single bad render is contained to that component/item instead
// of blanking the whole page.
//
// `fallback` is only for contexts where the default <p> would be invalid markup —
// e.g. a <tr> inside a <tbody> needs a <tr><td>...</td></tr> fallback, not a
// stray <p>, or the browser will relocate it and break the table's structure.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? DEFAULT_FALLBACK;
    }
    return this.props.children;
  }
}
