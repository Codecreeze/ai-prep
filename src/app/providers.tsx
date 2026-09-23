"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AppToaster } from "@/components/ui/AppToaster";

// Thin client-component boundary so the rest of the tree (layout, pages) can stay
// Server Components by default — only this wrapper needs "use client".
export const Providers = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    {children}
    <AppToaster />
  </Provider>
);
