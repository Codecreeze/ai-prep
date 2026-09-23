import { toast } from "sonner";

// Shared RTK Query onQueryStarted helper — fires a themed toast once a mutation
// actually succeeds server-side, without repeating the same try/await boilerplate
// in every endpoint definition. Errors are deliberately silent here: each form
// already shows its own inline error message, so a toast would just duplicate it.
export const notifySuccess = (message: string) => async (_arg: unknown, api: { queryFulfilled: Promise<unknown> }) => {
  try {
    await api.queryFulfilled;
    toast.success(message);
  } catch {
    // handled inline by the calling component
  }
};
