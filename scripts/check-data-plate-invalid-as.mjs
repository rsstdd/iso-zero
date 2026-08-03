import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const astroCli = resolve(projectRoot, "node_modules/astro/bin/astro.mjs");
const fixtureRoot = resolve(projectRoot, "tests/build-fixtures/data-plate-invalid-as");
const result = spawnSync(process.execPath, [astroCli, "--root", fixtureRoot, "build"], {
  cwd: projectRoot,
  encoding: "utf8",
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
});
const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

rmSync(resolve(fixtureRoot, ".astro"), { force: true, recursive: true });
rmSync(resolve(fixtureRoot, "dist"), { force: true, recursive: true });

if (result.status === 0) {
  throw new Error("Unsupported DataPlate root built successfully; expected a build failure.");
}

if (!output.includes("Unsupported DataPlate element") || !output.includes("section")) {
  throw new Error(`Unsupported DataPlate root failed for an unexpected reason:\n${output}`);
}

process.stdout.write("Verified unsupported DataPlate root rejection at build time.\n");
