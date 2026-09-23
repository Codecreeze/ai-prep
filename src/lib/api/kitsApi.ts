import { apiSlice } from "./apiSlice";
import type { Kit as KitContent, Question, Flashcard } from "@/server/validation/kitSchema";
import type { KitEditState } from "@/server/builder/editState";

// `import type` only — erased at compile time, so none of the server-only runtime
// code (mongoose, the LLM client, etc.) that these modules' neighbors pull in ends up
// in the client bundle. Only the Zod-inferred TypeScript types cross the boundary.
export type KitStatus = "pending" | "ready" | "failed";
export type KitSummary = {
  _id: string;
  status: KitStatus;
  input: { companyUrl: string };
  kit?: { source?: { company?: string; role?: string } };
  createdAt: string;
};
export type KitDetail = { _id: string; status: KitStatus; kit: KitContent | null; editState: KitEditState };
export type KitProgress = { status: KitStatus; progress: { stage: string; error: string | null } };
export type CreateKitInput = { jd: string; companyUrl: string; days: number };
export type Category = Question["category"];

const kitTag = (id: string) => ({ type: "Kit" as const, id });

export const kitsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listKits: builder.query<{ kits: KitSummary[] }, void>({
      query: () => "/kits",
      providesTags: ["KitList"],
    }),
    getKit: builder.query<{ kit: KitDetail }, string>({
      query: (id) => `/kits/${id}`,
      providesTags: (_result, _error, id) => [kitTag(id)],
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

    // --- Company brief ---
    editBrief: builder.mutation<{ kit: KitDetail }, { id: string; summary?: string; what_they_do?: string }>({
      query: ({ id, ...body }) => ({ url: `/kits/${id}/company-brief`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    pinBrief: builder.mutation<{ kit: KitDetail }, string>({
      query: (id) => ({ url: `/kits/${id}/company-brief/pin`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [kitTag(id)],
    }),
    unpinBrief: builder.mutation<{ kit: KitDetail }, string>({
      query: (id) => ({ url: `/kits/${id}/company-brief/unpin`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [kitTag(id)],
    }),
    regenerateBrief: builder.mutation<{ kit: KitDetail }, { id: string; force?: boolean }>({
      query: ({ id, force }) => ({ url: `/kits/${id}/regenerate/company-brief`, method: "POST", body: { force } }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),

    // --- Questions ---
    addQuestion: builder.mutation<{ kit: KitDetail }, { id: string } & Omit<Question, "id">>({
      query: ({ id, ...body }) => ({ url: `/kits/${id}/questions`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    editQuestion: builder.mutation<{ kit: KitDetail }, { id: string; qid: string; prompt?: string; answer_outline?: string; difficulty?: number }>({
      query: ({ id, qid, ...body }) => ({ url: `/kits/${id}/questions/${qid}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    deleteQuestion: builder.mutation<{ kit: KitDetail }, { id: string; qid: string }>({
      query: ({ id, qid }) => ({ url: `/kits/${id}/questions/${qid}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    moveQuestion: builder.mutation<{ kit: KitDetail }, { id: string; qid: string; toCategory: Category }>({
      query: ({ id, qid, toCategory }) => ({ url: `/kits/${id}/questions/${qid}/move`, method: "PATCH", body: { toCategory } }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    reorderQuestions: builder.mutation<{ kit: KitDetail }, { id: string; category: Category; orderedIds: string[] }>({
      query: ({ id, ...body }) => ({ url: `/kits/${id}/questions/reorder`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    pinQuestion: builder.mutation<{ kit: KitDetail }, { id: string; qid: string }>({
      query: ({ id, qid }) => ({ url: `/kits/${id}/questions/${qid}/pin`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    unpinQuestion: builder.mutation<{ kit: KitDetail }, { id: string; qid: string }>({
      query: ({ id, qid }) => ({ url: `/kits/${id}/questions/${qid}/unpin`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    regenerateQuestionsCategory: builder.mutation<{ kit: KitDetail }, { id: string; category: Category }>({
      query: ({ id, category }) => ({ url: `/kits/${id}/regenerate/questions/${category}`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),

    // --- Flashcards ---
    addFlashcard: builder.mutation<{ kit: KitDetail }, { id: string } & Omit<Flashcard, "id">>({
      query: ({ id, ...body }) => ({ url: `/kits/${id}/flashcards`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    editFlashcard: builder.mutation<{ kit: KitDetail }, { id: string; fid: string; front?: string; back?: string }>({
      query: ({ id, fid, ...body }) => ({ url: `/kits/${id}/flashcards/${fid}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    deleteFlashcard: builder.mutation<{ kit: KitDetail }, { id: string; fid: string }>({
      query: ({ id, fid }) => ({ url: `/kits/${id}/flashcards/${fid}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),
    pinFlashcard: builder.mutation<{ kit: KitDetail }, { id: string; fid: string }>({
      query: ({ id, fid }) => ({ url: `/kits/${id}/flashcards/${fid}/pin`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [kitTag(id)],
    }),

    // --- Schedule ---
    regenerateSchedule: builder.mutation<{ kit: KitDetail }, string>({
      query: (id) => ({ url: `/kits/${id}/regenerate/schedule`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [kitTag(id)],
    }),
  }),
});

export const {
  useListKitsQuery,
  useGetKitQuery,
  useGetKitStatusQuery,
  useCreateKitMutation,
  useDeleteKitMutation,
  useEditBriefMutation,
  usePinBriefMutation,
  useUnpinBriefMutation,
  useRegenerateBriefMutation,
  useAddQuestionMutation,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useMoveQuestionMutation,
  useReorderQuestionsMutation,
  usePinQuestionMutation,
  useUnpinQuestionMutation,
  useRegenerateQuestionsCategoryMutation,
  useAddFlashcardMutation,
  useEditFlashcardMutation,
  useDeleteFlashcardMutation,
  usePinFlashcardMutation,
  useRegenerateScheduleMutation,
} = kitsApi;
