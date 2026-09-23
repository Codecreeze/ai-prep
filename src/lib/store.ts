import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import uiReducer from "./uiSlice";

// One store for both RTK Query's server-state cache and client-only slices — see
// Rules/02-state-management.md for why RTK Query replaced a separate Zustand+
// TanStack Query split.
export const store = configureStore({
  reducer: { [apiSlice.reducerPath]: apiSlice.reducer, ui: uiReducer },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
