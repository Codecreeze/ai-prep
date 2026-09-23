import { apiSlice } from "./apiSlice";
import type { Flashcard } from "@/server/validation/kitSchema";

export type PracticeCoverage = {
  coveredCount: number;
  totalCount: number;
  byRequirement: Record<string, { covered: number; total: number }>;
};
export type ReadinessEntry = {
  priority: "must" | "nice";
  hasCoverage: boolean;
  hasFlashcards: boolean;
  avgConfidence: number | null;
  score: number;
};
export type ReadinessScore = { overall: number; byRequirement: Record<string, ReadinessEntry> };

export const practiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNextSession: builder.query<{ flashcards: Flashcard[] }, string>({
      query: (id) => `/kits/${id}/practice/next`,
      providesTags: (_r, _e, id) => [{ type: "Kit" as const, id: `${id}-practice` }],
    }),
    getPracticeCoverage: builder.query<PracticeCoverage, string>({
      query: (id) => `/kits/${id}/practice/coverage`,
      providesTags: (_r, _e, id) => [{ type: "Kit" as const, id: `${id}-practice` }],
    }),
    answerCard: builder.mutation<{ ok: true }, { id: string; cardId: string; confidence: number }>({
      query: ({ id, cardId, confidence }) => ({ url: `/kits/${id}/practice/${cardId}/answer`, method: "POST", body: { confidence } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Kit" as const, id: `${id}-practice` }],
    }),
    getReadinessScore: builder.query<ReadinessScore, string>({
      query: (id) => `/kits/${id}/practice/readiness`,
      providesTags: (_r, _e, id) => [{ type: "Kit" as const, id: `${id}-practice` }],
    }),
  }),
});

export const {
  useGetNextSessionQuery,
  useGetPracticeCoverageQuery,
  useAnswerCardMutation,
  useGetReadinessScoreQuery,
} = practiceApi;
