import { defineConfig, devices } from "@playwright/test";
import { process } from "zod/v4/core";

const PORT = 4321;

/**
 * One critical-path spec per project. The goal is not coverage; it is proving
 * the app boots and the primary flow works, and keeping the muscle memory alive.
 */
export default defineConfig({
  testDir: "./tests/browser",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "pnpm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
