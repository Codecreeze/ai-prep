import { apiSlice } from "./apiSlice";
import type { Kit as KitContent } from "@/server/validation/kitSchema";

// `import type` only — erased at compile time, so none of the server-only runtime
// code (mongoose, the LLM client, etc.) that kitSchema.ts's neighbors pull in ends up
// in the client bundle. Only the Zod-inferred TypeScript type crosses the boundary.
export type KitStatus = "pending" | "ready" | "failed";
export type KitSummary = {
  _id: string;
  status: KitStatus;
  input: { companyUrl: string };
  kit?: { source?: { company?: string; role?: string } };
  createdAt: string;
};
export type KitDetail = { _id: string; status: KitStatus; kit: KitContent | null };
export type KitProgress = { status: KitStatus; progress: { stage: string; error: string | null } };
export type CreateKitInput = { jd: string; companyUrl: string; days: number };

export const kitsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listKits: builder.query<{ kits: KitSummary[] }, void>({
      query: () => "/kits",
      providesTags: ["KitList"],
    }),
    getKit: builder.query<{ kit: KitDetail }, string>({
      query: (id) => `/kits/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Kit", id }],
    }),
    getKitStatus: builder.query<KitProgress, string>({
      query: (id) => `/kits/${id}/status`,
    }),
    createKit: builder.mutation<{ kitId: string; status: KitStatus }, CreateKitInput>({
      query: (body) => ({ url: "/kits", method: "POST", body }),
      invalidatesTags: ["KitList"],
    }),
    deleteKit: builder.mutation<{ ok: true }, string>({
      query: (id) => ({ url: `/kits/${id}`, method: "DELETE" }),
      invalidatesTags: ["KitList"],
    }),
  }),
});

export const {
  useListKitsQuery,
  useGetKitQuery,
  useGetKitStatusQuery,
  useCreateKitMutation,
  useDeleteKitMutation,
} = kitsApi;
