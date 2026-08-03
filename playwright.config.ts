import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const node = JSON.stringify(process.execPath);
const astro = JSON.stringify(resolve("node_modules/astro/bin/astro.mjs"));
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

interface TargetConfig {
  name: string;
  port: number;
  root: string;
  match: string;
  env?: Record<string, string>;
}

// 1. Define distinct test environments
const targets: TargetConfig[] = [
  {
    name: "data-plate",
    port: 4323,
    root: "tests/component-fixtures/data-plate",
    match: "data-plate*.spec.ts",
  },
  {
    name: "featured-gallery",
    port: 4325,
    root: "tests/component-fixtures/featured-gallery",
    match: "featured-gallery*.spec.ts",
    env: { TZ: "Pacific/Honolulu" },
  },
  {
    name: "site-footer",
    port: 4322,
    root: ".",
    match: "site-footer*.spec.ts",
    env: { TZ: "Pacific/Honolulu" },
  },
  {
    name: "header",
    port: 4321,
    root: ".",
    match: "site-header*.spec.ts",
    env: { TZ: "Pacific/Honolulu" },
  },
  {
    name: "homepage-identity",
    port: 4320,
    root: ".",
    match: "homepage-identity*.spec.ts",
    env: { TZ: "Pacific/Honolulu" },
  },
  {
    name: "homepage",
    port: 4320,
    root: ".",
    match: "homepage.spec.ts", // Explicit match to prevent running homepage-identity*.spec.ts twice
    env: { TZ: "Pacific/Honolulu" },
  },
];

// 2. Define browser configurations
const browsers = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      ...(chromiumExecutablePath
        ? { launchOptions: { executablePath: chromiumExecutablePath } }
        : {}),
    },
  },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];

// 3. Deduplicate webServer instances by port to prevent launch collisions
const uniqueServers = Array.from(
  new Map(targets.map((t) => [t.port, { port: t.port, root: t.root, env: t.env }])).values()
);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    colorScheme: "dark",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  // Launch unique Astro preview servers
  webServer: uniqueServers.map(({ port, root, env }) => {
    const rootArg = root !== "." ? `--root ${root}` : "";
    const buildCommand = `${node} ${astro} ${rootArg} build`.replace(/\s+/g, " ");
    const previewCommand = `${node} ${astro} ${rootArg} preview --host 127.0.0.1 --port ${port}`.replace(/\s+/g, " ");

    return {
      command: `${buildCommand} && ${previewCommand}`,
      port,
      ...(env ? { env } : {}),
      reuseExistingServer: !process.env.CI,
    };
  }),

  // Generate matrix of Target × Browser projects
  projects: targets.flatMap((target) =>
    browsers.map((browser) => ({
      name: `${target.name}-${browser.name}`,
      testMatch: target.match,
      use: {
        ...browser.use,
        baseURL: `http://127.0.0.1:${target.port}`,
      },
    }))
  ),
});
