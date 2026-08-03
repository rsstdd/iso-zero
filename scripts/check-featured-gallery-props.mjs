import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const componentPath = resolve(
	projectRoot,
	"src/components/FeaturedGallery.astro",
);
const validFixturePath = resolve(
	projectRoot,
	"tests/type-fixtures/featured-gallery-valid.ts.fixture",
);
const invalidFixturePath = resolve(
	projectRoot,
	"tests/type-fixtures/featured-gallery-invalid.ts.fixture",
);
const tscCli = resolve(projectRoot, "node_modules/typescript/bin/tsc");
const declarations = extractContractDeclarations(
	readFileSync(componentPath, "utf8"),
);
const temporaryRoot = mkdtempSync(
	join(tmpdir(), "iso-zero-featured-gallery-props-"),
);

try {
	const validResult = compileFixture("valid.ts", validFixturePath);
	if (validResult.status !== 0) {
		throw new Error(
			`Supported FeaturedGallery props failed type-checking:\n${validResult.output}`,
		);
	}

	const invalidResult = compileFixture("invalid.ts", invalidFixturePath);
	if (invalidResult.status === 0) {
		throw new Error("Unsupported FeaturedGallery props passed type-checking.");
	}

	for (const expectedDiagnostic of [
		"Property 'slug' is missing",
		"Type 'string' is not assignable to type 'Date'",
		"Type 'string' is not assignable to type 'number'",
		"Type 'string' is not assignable to type 'ImageMetadata'",
	]) {
		if (!invalidResult.output.includes(expectedDiagnostic)) {
			throw new Error(
				`FeaturedGallery prop check did not report ${expectedDiagnostic}:\n${invalidResult.output}`,
			);
		}
	}

	const readonlyDiagnostics =
		invalidResult.output.match(/read-only property/g) ?? [];
	if (readonlyDiagnostics.length < 3) {
		throw new Error(
			`FeaturedGallery prop check did not reject all readonly mutations:\n${invalidResult.output}`,
		);
	}

	process.stdout.write(
		"Verified supported and unsupported FeaturedGallery prop types.\n",
	);
} finally {
	rmSync(temporaryRoot, { force: true, recursive: true });
}

function compileFixture(filename, fixturePath) {
	const targetPath = resolve(temporaryRoot, filename);
	const fixture = readFileSync(fixturePath, "utf8");
	const imageMetadataDeclaration = `
interface ImageMetadata {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly format: string;
}
`;
	writeFileSync(
		targetPath,
		`${imageMetadataDeclaration}\n${declarations}\n\n${fixture}\n`,
		"utf8",
	);

	const result = spawnSync(
		process.execPath,
		[
			tscCli,
			"--noEmit",
			"--ignoreConfig",
			"--strict",
			"--skipLibCheck",
			"--target",
			"ES2022",
			"--module",
			"NodeNext",
			"--moduleResolution",
			"NodeNext",
			targetPath,
		],
		{ cwd: projectRoot, encoding: "utf8" },
	);

	return {
		output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
		status: result.status,
	};
}

function extractContractDeclarations(componentSource) {
	const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(componentSource)?.[1];
	if (!frontmatter) {
		throw new Error(
			`FeaturedGallery component has no parseable frontmatter: ${componentPath}`,
		);
	}

	const sourceFile = ts.createSourceFile(
		"FeaturedGallery.frontmatter.ts",
		frontmatter,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);
	const declarations = sourceFile.statements.filter(
		(statement) =>
			ts.isInterfaceDeclaration(statement) &&
			["FeaturedGalleryModel", "Props"].includes(statement.name.text),
	);

	if (declarations.length !== 2) {
		throw new Error(
			`FeaturedGallery must declare FeaturedGalleryModel and Props interfaces: ${componentPath}`,
		);
	}

	return declarations
		.map((declaration) => declaration.getText(sourceFile))
		.join("\n\n");
}
