import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    // Tests intentionally render named stories; production preview modules must
    // share plain TSX instead (CONTRIBUTING.md, Storybook registration).
    return /\.[jt]sx?$/.test(file) && !/\.(?:test|spec)\.[jt]sx?$/.test(file) ? [file] : [];
  });
}

it("keeps both showcases free of imports from story registration modules", () => {
  const roots = [fileURLToPath(new URL("./", import.meta.url)), fileURLToPath(new URL("../../native/src/", import.meta.url))];
  const violations: string[] = [];
  for (const file of roots.flatMap(sourceFiles)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const inspect = (node: ts.Node): void => {
      const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
        ? node.moduleSpecifier
        : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
          ? node.arguments[0]
          : undefined;
      if (specifier && ts.isStringLiteral(specifier) && /\.stories(?:\.[jt]sx?)?$/.test(specifier.text)) {
        violations.push(`${file}: ${specifier.text}`);
      }
      ts.forEachChild(node, inspect);
    };
    inspect(source);
  }
  expect(violations).toEqual([]);
});
