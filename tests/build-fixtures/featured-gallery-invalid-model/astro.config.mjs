import { defineConfig } from "astro/config";

const testCase = process.env.FEATURED_GALLERY_INVALID_CASE ?? "valid";

export default defineConfig({
	output: "static",
	outDir: `./dist-${testCase}`,
	integrations: [],
	image: {
		service: { entrypoint: "astro/assets/services/sharp" },
	},
});
