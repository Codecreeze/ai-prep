import { defineConfig } from "vitest/config";
import path from "node:path";

// Minimal config: node environment (server-only logic for now), @ alias to match tsconfig.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
