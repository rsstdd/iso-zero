import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const astroCli = resolve(projectRoot, "node_modules/astro/bin/astro.mjs");
const fixtureRoot = resolve(projectRoot, "tests/build-fixtures/invalid-current-path");
const result = spawnSync(process.execPath, [astroCli, "--root", fixtureRoot, "build"], {
  cwd: projectRoot,
  encoding: "utf8",
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
});
const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

rmSync(resolve(fixtureRoot, ".astro"), { force: true, recursive: true });
rmSync(resolve(fixtureRoot, "dist"), { force: true, recursive: true });

if (result.status === 0) {
  throw new Error("Invalid currentPath fixture built successfully; expected a build failure.");
}

if (!output.includes("currentPath") || !output.includes("trailing slash")) {
  throw new Error(`Invalid currentPath failed for an unexpected reason:\n${output}`);
}

process.stdout.write("Verified invalid currentPath rejection at build time.\n");
