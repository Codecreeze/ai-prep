import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Single RTK Query base for the whole app — credentials:"include" sends the
// httpOnly session cookie automatically, no manual header wiring per call.
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Kit", "KitList"],
  endpoints: () => ({}),
});
