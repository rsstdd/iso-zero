import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const expectedRoutes = ["/", "/about/", "/galleries/", "/galleries/venice/"];

await Promise.all(
  expectedRoutes.map(async (route) => {
    const relativeOutput = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
    const outputPath = resolve(projectRoot, "dist", relativeOutput);
    await access(outputPath).catch(() => {
      throw new Error(`Required Header fixture route did not build: ${route}`);
    });

    const html = await readFile(outputPath, "utf8");
    const headerCount = html.match(/<header\b[^>]*class="site-header"/g)?.length ?? 0;
    if (headerCount !== 1) {
      throw new Error(`${route} must contain exactly one site Header; found ${headerCount}.`);
    }
  }),
);

process.stdout.write(`Verified ${expectedRoutes.length} required Header fixture routes.\n`);
