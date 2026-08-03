import { rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist");

if (dirname(outputDirectory) !== projectRoot || basename(outputDirectory) !== "dist") {
  throw new Error(`Refusing to clean unexpected output directory: ${outputDirectory}`);
}

await rm(outputDirectory, { force: true, recursive: true });
