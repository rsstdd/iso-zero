import { readdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist");
const outputFiles = await walk(outputDirectory);

const scriptAssets = outputFiles.filter((filePath) =>
  [".js", ".mjs", ".cjs"].includes(extname(filePath)),
);
if (scriptAssets.length > 0) {
  throw new Error(`Static output contains script assets:\n${scriptAssets.join("\n")}`);
}

for (const filePath of outputFiles.filter((candidate) => extname(candidate) === ".html")) {
  const html = await readFile(filePath, "utf8");
  if (/<script\b/i.test(html) || /\son[a-z]+\s*=/i.test(html)) {
    throw new Error(`Static output contains client behavior: ${filePath}`);
  }
}

process.stdout.write(`Verified zero client scripts across ${outputFiles.length} output files.\n`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }),
  );
  return results.flat();
}
