import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  // React only where interactivity actually lives. The static image grid
  // ships zero JavaScript, which is the entire argument for Astro here.
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  image: {
    // Sharp has been the default since Astro 6.1, so this is explicit rather
    // than necessary. Being explicit costs nothing and documents the choice.
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
