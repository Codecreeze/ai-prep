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
      onQueryStarted: notifySuccess("Signed in"),
    }),
    logout: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Kit", "KitList"], // clears any cached kit data on sign-out
      onQueryStarted: notifySuccess("Signed out"),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation } = authApi;
