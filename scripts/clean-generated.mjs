import { rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const generatedPaths = [
  "dist",
  ".astro",
  "playwright-report",
  "test-results",
  "tests/build-fixtures/data-plate-invalid-as/.astro",
  "tests/build-fixtures/data-plate-invalid-as/dist",
  "tests/build-fixtures/data-plate-invalid-as/node_modules",
  "tests/component-fixtures/data-plate/.astro",
  "tests/component-fixtures/data-plate/dist",
  "tests/component-fixtures/data-plate/node_modules",
];

for (const generatedPath of generatedPaths) {
  const target = resolve(projectRoot, generatedPath);
  const resolvedRelativePath = relative(projectRoot, target).split(sep).join("/");
  if (resolvedRelativePath !== generatedPath) {
    throw new Error(`Refusing to clean unexpected generated path: ${target}`);
  }
  await rm(target, { force: true, recursive: true });
}
