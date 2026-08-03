import { defineConfig } from "astro/config";

export default defineConfig({
	output: "static",
	trailingSlash: "always",
	integrations: [],
	image: {
		service: { entrypoint: "astro/assets/services/sharp" },
	},
});
