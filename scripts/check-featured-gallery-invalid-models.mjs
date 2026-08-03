import { spawnSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const fixtureRoot = resolve(
	projectRoot,
	"tests/build-fixtures/featured-gallery-invalid-model",
);
const astroCli = resolve(projectRoot, "node_modules/astro/bin/astro.mjs");
const invalidCases = [
	"blank-slug",
	"blank-title",
	"blank-location",
	"invalid-date",
	"zero-count",
	"blank-hero-id",
	"blank-alt",
	"unknown-dimensions",
	"dimension-mismatch",
	"source-ceiling",
	"delivery-policy",
];

try {
	const validResult = buildCase("valid");
	if (validResult.status !== 0) {
		throw new Error(
			`FeaturedGallery valid control fixture failed to build:\n${validResult.output}`,
		);
	}

	for (const testCase of invalidCases) {
		const result = buildCase(testCase);
		if (result.status === 0) {
			throw new Error(
				`FeaturedGallery accepted invalid model case: ${testCase}`,
			);
		}

		if (/Cannot find module|Could not resolve|ENOENT/.test(result.output)) {
			throw new Error(
				`FeaturedGallery ${testCase} failed for fixture resolution rather than validation:\n${result.output}`,
			);
		}
	}

	process.stdout.write(
		`Verified valid control and ${invalidCases.length} FeaturedGallery failure cases.\n`,
	);
} finally {
	for (const entry of readdirSync(fixtureRoot, { withFileTypes: true })) {
		if (!entry.isDirectory() || !entry.name.startsWith("dist-")) continue;
		rmSync(resolve(fixtureRoot, entry.name), {
			force: true,
			recursive: true,
		});
	}
	rmSync(resolve(fixtureRoot, ".astro"), { force: true, recursive: true });
}

function buildCase(testCase) {
	const result = spawnSync(
		process.execPath,
		[astroCli, "--root", fixtureRoot, "build"],
		{
			cwd: projectRoot,
			encoding: "utf8",
			env: {
				...process.env,
				ASTRO_TELEMETRY_DISABLED: "1",
				FEATURED_GALLERY_INVALID_CASE: testCase,
				TZ: "Pacific/Honolulu",
			},
		},
	);

	return {
		output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
		status: result.status,
	};
}
