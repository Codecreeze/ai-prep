import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Cross-tree client UI state (sidebar collapse, and tracking kits the user is
// actively waiting on) — a Redux slice per Rules/02 rather than prop-drilling,
// since these are read/written from components in different subtrees (the create
// form, the completion watcher, and the modal all live separately). Kit-list search
// is NOT here — it's local state owned by the Kits page/table, since nothing outside
// that one subtree needs it (see KitsTable.tsx).
export type CompletedKitNotice = { id: string; role: string; company: string; status: "ready" | "failed" };

type UiState = {
  sidebarCollapsed: boolean;
  watchingKitIds: string[];
  completedKitNotice: CompletedKitNotice | null;
};

const initialState: UiState = { sidebarCollapsed: false, watchingKitIds: [], completedKitNotice: null };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    watchKit: (state, action: PayloadAction<string>) => {
      if (!state.watchingKitIds.includes(action.payload)) state.watchingKitIds.push(action.payload);
    },
    unwatchKit: (state, action: PayloadAction<string>) => {
      state.watchingKitIds = state.watchingKitIds.filter((id) => id !== action.payload);
    },
    setCompletedKitNotice: (state, action: PayloadAction<CompletedKitNotice | null>) => {
      state.completedKitNotice = action.payload;
    },
  },
});

export const { toggleSidebar, watchKit, unwatchKit, setCompletedKitNotice } = uiSlice.actions;
export default uiSlice.reducer;
