import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const navigationPath = resolve(projectRoot, "src/config/footer-navigation.json");
const navigation = JSON.parse(await readFile(navigationPath, "utf8"));
const links = [...navigation.project, ...navigation.legal];
const labels = links.map(({ label }) => label);
const routes = links.map(({ href }) => href);

if (new Set(labels).size !== labels.length) {
  throw new Error("Footer navigation contains duplicate labels.");
}

if (new Set(routes).size !== routes.length) {
  throw new Error("Footer navigation contains duplicate routes.");
}

await Promise.all(
  routes.map(async (route) => {
    const outputPath = resolve(projectRoot, "dist", route.slice(1), "index.html");
    try {
      await access(outputPath);
    } catch {
      throw new Error(`Required Footer route did not build: ${route}`);
    }
  }),
);

process.stdout.write(`Verified ${routes.length} required Footer routes.\n`);
