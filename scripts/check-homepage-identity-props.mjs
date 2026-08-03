import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const componentPath = resolve(projectRoot, "src/components/HomepageIdentity.astro");
const validFixturePath = resolve(
  projectRoot,
  "tests/type-fixtures/homepage-identity-valid.ts.fixture",
);
const invalidFixturePath = resolve(
  projectRoot,
  "tests/type-fixtures/homepage-identity-invalid.ts.fixture",
);
const tscCli = resolve(projectRoot, "node_modules/typescript/bin/tsc");
const propsDeclaration = extractPropsInterface(readFileSync(componentPath, "utf8"));
const temporaryRoot = mkdtempSync(join(tmpdir(), "iso-zero-homepage-identity-props-"));

try {
  const validResult = compileFixture("valid.ts", validFixturePath);
  if (validResult.status !== 0) {
    throw new Error(
      `Supported HomepageIdentity props failed type-checking:\n${validResult.output}`,
    );
  }

  const invalidResult = compileFixture("invalid.ts", invalidFixturePath);
  if (invalidResult.status === 0) {
    throw new Error(
      "Unsupported HomepageIdentity props passed type-checking; expected diagnostics.",
    );
  }

  for (const expectedDiagnostic of [
    "ISO Null",
    "Photographs by Ross Todd",
    "identity-title",
    "read-only",
  ]) {
    if (!invalidResult.output.includes(expectedDiagnostic)) {
      throw new Error(
        `HomepageIdentity prop check did not report ${expectedDiagnostic}:\n${invalidResult.output}`,
      );
    }
  }

  const blankDiagnostics = invalidResult.output.match(/Type '""' is not assignable/g) ?? [];
  if (blankDiagnostics.length < 2) {
    throw new Error(
      `HomepageIdentity prop check did not reject both blank literal values:\n${invalidResult.output}`,
    );
  }

  process.stdout.write("Verified supported and unsupported HomepageIdentity prop types.\n");
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}

function compileFixture(filename, fixturePath) {
  const targetPath = resolve(temporaryRoot, filename);
  const fixture = readFileSync(fixturePath, "utf8");
  writeFileSync(targetPath, `${propsDeclaration}\n\n${fixture}\n`, "utf8");

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

function extractPropsInterface(componentSource) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(componentSource)?.[1];
  if (!frontmatter) {
    throw new Error(`HomepageIdentity component has no parseable frontmatter: ${componentPath}`);
  }

  const sourceFile = ts.createSourceFile(
    "HomepageIdentity.frontmatter.ts",
    frontmatter,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declaration = sourceFile.statements.find(
    (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === "Props",
  );

  if (!declaration || !ts.isInterfaceDeclaration(declaration)) {
    throw new Error(
      `HomepageIdentity component does not declare interface Props: ${componentPath}`,
    );
  }

  return declaration.getText(sourceFile);
}
