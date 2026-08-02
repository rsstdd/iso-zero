import { getViteConfig } from "astro/config";

/**
 * getViteConfig rather than plain defineConfig, because Astro's own Vite
 * pipeline must be inherited for the React integration and the astro:content
 * virtual modules to resolve inside tests.
 */
export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.astro/**", "**/tests/browser/**"],
  },
});
