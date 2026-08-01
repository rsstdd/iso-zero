import { defineConfig } from "@playwright/test";

/**
 * One critical-path spec per project. The goal is not coverage; it is proving
 * the app boots and the primary flow works, and keeping the muscle memory alive.
 */
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:4321", trace: "on-first-retry" },
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
