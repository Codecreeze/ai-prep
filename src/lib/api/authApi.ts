import { toast } from "sonner";
import { apiSlice } from "./apiSlice";
import { notifySuccess } from "./notifySuccess";

type AuthUser = { id: string; email: string };
type Credentials = { email: string; password: string };

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ user: AuthUser }, Credentials>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      onQueryStarted: notifySuccess("Account created"),
    }),
    login: builder.mutation<{ user: AuthUser }, Credentials>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      // Also resets the cache here, not just on logout — covers a session that
      // ended by silently expiring (no logout click happened) and a different
      // account then signing in on the same tab.
      onQueryStarted: async (_arg, api) => {
        try {
          await api.queryFulfilled;
          toast.success("Signed in");
          api.dispatch(apiSlice.util.resetApiState());
        } catch {
          // handled inline by the calling component
        }
      },
    }),
    logout: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      // Tag invalidation alone isn't enough here: it only refetches queries that are
      // still actively subscribed at the moment it fires, and by the time logout
      // resolves the dashboard has already unmounted (nothing subscribed). Without a
      // full cache reset, a subscription mounted later under a *different* signed-in
      // user could still read the previous user's cached kit data for a moment.
      // resetApiState() clears every cached query unconditionally, so the next
      // account always starts from a clean slate.
      onQueryStarted: async (_arg, api) => {
        try {
          await api.queryFulfilled;
          toast.success("Signed out");
          api.dispatch(apiSlice.util.resetApiState());
        } catch {
          // handled inline by the calling component
        }
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation } = authApi;
