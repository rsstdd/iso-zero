import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Minimal ESLint config. Formatting, imports, and general lint are Biome's job.
 * This config exists only for the hooks rules and the React Compiler
 * diagnostics, which Biome does not implement. Treat those diagnostics as a
 * tutor rather than as noise.
 *
 * "recommended-latest" is deliberate: in eslint-plugin-react-hooks v6 it is the
 * preset carrying the compiler-powered rules (purity, refs, set-state-in-effect,
 * preserve-manual-memoization, and friends). The preset is preferred over
 * listing rules by name, because the compiler rule names are still settling
 * between plugin releases and an unknown rule name is a hard error that breaks
 * lint entirely.
 */
const preset =
  reactHooks.configs?.["recommended-latest"] ??
  reactHooks.configs?.flat?.["recommended-latest"] ??
  reactHooks.configs?.recommended;

export default [
  { ignores: ["dist/", ".next/", ".astro/", "node_modules/", "e2e/", "playwright-report/"] },
  {
    ...preset,
    files: ["**/*.{js,jsx,ts,tsx}"],
    // espree cannot parse TypeScript, so without an explicit parser this config
    // would error on every .ts/.tsx file in the repo.
    languageOptions: {
      ...preset?.languageOptions,
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
