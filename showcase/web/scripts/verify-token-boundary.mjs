import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const exceptionDocument = JSON.parse(
  await readFile(new URL("../token-boundary-exceptions.json", import.meta.url), "utf8"),
);

const CSS_TYPOGRAPHY_PROPERTIES = new Set([
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "font-variant-numeric",
  "letter-spacing",
  "line-height",
]);
const JSX_LENGTH_PROPERTIES = /^(?:blockSize|borderRadius|borderWidth|bottom|columnGap|gap|height|inset(?:Block|BlockEnd|BlockStart|Inline|InlineEnd|InlineStart)?|left|margin(?:Block|BlockEnd|BlockStart|Bottom|Inline|InlineEnd|InlineStart|Left|Right|Top)?|maxHeight|maxWidth|minHeight|minWidth|outlineOffset|padding(?:Block|BlockEnd|BlockStart|Bottom|Inline|InlineEnd|InlineStart|Left|Right|Top)?|right|rowGap|top|width)$/;
const JSX_TYPOGRAPHY_PROPERTIES = new Set([
  "font",
  "fontFamily",
  "fontSize",
  "fontVariantNumeric",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
]);

const rawLength = /(?<![\w.-])[-+]?(?:0*[1-9]\d*(?:\.\d+)?|0?\.\d*[1-9])(?:px|r?em)\b/i;
const rawMotion = /(?<![\w.-])(?:0*[1-9]\d*(?:\.\d+)?|0?\.\d*[1-9])m?s\b/i;
const rawColor = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/i;
const rawTimingFunction = /\b(?:ease|ease-in|ease-out|ease-in-out|linear)\b/i;

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function lineAt(source, offset) {
  return source.slice(0, offset).split("\n").length;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(absolute);
      if (!/\.(?:css|ts|tsx)$/.test(entry.name) || /\.test\.[^.]+$/.test(entry.name)) return [];
      return [absolute];
    }),
  );
  return nested.flat();
}

function finding({ file, line, property, rule, selector, value }) {
  return { file, line, property, rule, selector, value: normalize(value) };
}

function cssFindings(relative, source) {
  const findings = [];
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const block of withoutComments.matchAll(blockPattern)) {
    const selector = normalize(block[1]);
    const body = block[2];
    const bodyOffset = (block.index ?? 0) + block[0].indexOf(body);
    for (const declaration of body.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      if (!property || !value) continue;
      const line = lineAt(withoutComments, bodyOffset + body.indexOf(declaration));
      if (rawLength.test(value)) {
        findings.push(finding({ file: relative, line, property, rule: "raw-length", selector, value }));
      }
      if (rawColor.test(value)) {
        findings.push(finding({ file: relative, line, property, rule: "raw-color", selector, value }));
      }
      if (property.endsWith("shadow") && !value.includes("var(--hjm-shadow-")) {
        findings.push(finding({ file: relative, line, property, rule: "raw-shadow", selector, value }));
      }
      if (
        rawMotion.test(value) ||
        ((property.startsWith("animation") || property.startsWith("transition")) && rawTimingFunction.test(value))
      ) {
        findings.push(finding({ file: relative, line, property, rule: "raw-motion", selector, value }));
      }
      if (
        CSS_TYPOGRAPHY_PROPERTIES.has(property) &&
        value !== "inherit" &&
        value !== "normal" &&
        !value.includes("var(--hjm-")
      ) {
        findings.push(finding({ file: relative, line, property, rule: "raw-typography", selector, value }));
      }
    }
  }

  const atRulePattern = /@(media|container)\s*([^\{]+)/g;
  for (const match of withoutComments.matchAll(atRulePattern)) {
    const value = normalize(match[2]);
    if (!rawLength.test(value)) continue;
    findings.push(
      finding({
        file: relative,
        line: lineAt(withoutComments, match.index ?? 0),
        property: "condition",
        rule: "raw-length",
        selector: `@${match[1]}`,
        value,
      }),
    );
  }
  return findings;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function literalValue(node) {
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.reduce(
      (value, span) => `${value}111111${span.literal.text}`,
      node.head.text,
    );
  }
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return `${node.operator === ts.SyntaxKind.MinusToken ? "-" : "+"}${node.operand.text}`;
  }
  return undefined;
}

function jsxStyleFindings(relative, source) {
  const sourceFile = ts.createSourceFile(
    relative,
    source,
    ts.ScriptTarget.Latest,
    true,
    relative.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];
  const functionNames = [];
  const styleDefinitions = new Map();

  function unwrapExpression(node) {
    let expression = node;
    while (
      ts.isAsExpression(expression) ||
      ts.isSatisfiesExpression(expression) ||
      ts.isTypeAssertionExpression(expression) ||
      ts.isParenthesizedExpression(expression)
    ) {
      expression = expression.expression;
    }
    return expression;
  }

  function containingScope(node) {
    let current = node;
    while (current && !ts.isSourceFile(current) && !ts.isFunctionLike(current)) {
      current = current.parent;
    }
    return current ?? sourceFile;
  }

  function collectStyleDefinition(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);
      if (ts.isObjectLiteralExpression(initializer)) {
        const scope = containingScope(node);
        const definitions = styleDefinitions.get(scope) ?? new Map();
        const named = definitions.get(node.name.text) ?? [];
        named.push({ declaration: node, object: initializer });
        definitions.set(node.name.text, named);
        styleDefinitions.set(scope, definitions);
      }
    }
    ts.forEachChild(node, collectStyleDefinition);
  }

  function resolveStyleObject(identifier) {
    let scope = containingScope(identifier);
    while (scope) {
      const candidates = styleDefinitions.get(scope)?.get(identifier.text) ?? [];
      const declaration = candidates
        .filter((candidate) => candidate.declaration.getStart(sourceFile) < identifier.getStart(sourceFile))
        .at(-1);
      if (declaration) return declaration.object;
      scope = scope.parent ? containingScope(scope.parent) : undefined;
    }
    return undefined;
  }

  function inspectObject(object, selector) {
    for (const member of object.properties) {
      if (!ts.isPropertyAssignment(member)) continue;
      const property = propertyName(member.name);
      if (!property) continue;
      const initializer = unwrapExpression(member.initializer);
      const value = literalValue(initializer);
      if (value === undefined) continue;
      const line = sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile)).line + 1;
      const numericLength =
        (ts.isNumericLiteral(initializer) ||
          (ts.isPrefixUnaryExpression(initializer) && ts.isNumericLiteral(initializer.operand))) &&
        Number(value) !== 0;
      if (JSX_LENGTH_PROPERTIES.test(property) && numericLength) {
        findings.push(finding({ file: relative, line, property, rule: "raw-length", selector, value }));
      } else if (rawLength.test(value)) {
        findings.push(finding({ file: relative, line, property, rule: "raw-length", selector, value }));
      }
      if (rawColor.test(value)) {
        findings.push(finding({ file: relative, line, property, rule: "raw-color", selector, value }));
      }
      if ((property === "boxShadow" || property === "textShadow") && !value.includes("var(--hjm-shadow-")) {
        findings.push(finding({ file: relative, line, property, rule: "raw-shadow", selector, value }));
      }
      if (
        (property.startsWith("animation") || property.startsWith("transition")) &&
        (rawMotion.test(value) || rawTimingFunction.test(value))
      ) {
        findings.push(finding({ file: relative, line, property, rule: "raw-motion", selector, value }));
      }
      if (JSX_TYPOGRAPHY_PROPERTIES.has(property) && value !== "inherit" && value !== "normal" && !value.includes("var(--hjm-")) {
        findings.push(finding({ file: relative, line, property, rule: "raw-typography", selector, value }));
      }
    }
  }

  function visit(node) {
    let pushed = false;
    if (ts.isFunctionDeclaration(node) && node.name) {
      functionNames.push(node.name.text);
      pushed = true;
    }
    if (ts.isJsxAttribute(node) && node.name.text === "style" && node.initializer && ts.isJsxExpression(node.initializer)) {
      const expression = node.initializer.expression
        ? unwrapExpression(node.initializer.expression)
        : undefined;
      const object = expression && ts.isObjectLiteralExpression(expression)
        ? expression
        : expression && ts.isIdentifier(expression)
          ? resolveStyleObject(expression)
          : undefined;
      if (object) {
        const parent = node.parent.parent;
        const tag = ts.isJsxOpeningLikeElement(parent) ? parent.tagName.getText(sourceFile) : "element";
        inspectObject(object, `${functionNames.at(-1) ?? "module"}/${tag}[style]`);
      }
    }
    ts.forEachChild(node, visit);
    if (pushed) functionNames.pop();
  }
  collectStyleDefinition(sourceFile);
  visit(sourceFile);
  return findings;
}

function assertVerifierRegressionCoverage() {
  const source = [
    'function Probe(value: { fontSize: number }) {',
    '  const style = {',
    '    fontSize: `calc(${value.fontSize}px * var(--hjm-text-scale))`,',
    '    lineHeight: 24,',
    '    letterSpacing: "0.2px",',
    '  };',
    '  const tokenStyle = { width: "var(--hjm-space-md)" };',
    '  return <><p style={style}>Probe</p><span style={tokenStyle}>Safe</span></>;',
    '}',
  ].join("\n");
  const findings = jsxStyleFindings("internal-token-boundary-regression.tsx", source);
  const signatures = new Set(findings.map(({ property, rule }) => `${property}/${rule}`));
  const expected = [
    "fontSize/raw-length",
    "lineHeight/raw-typography",
    "letterSpacing/raw-length",
    "letterSpacing/raw-typography",
  ];
  if (
    findings.length !== expected.length ||
    expected.some((signature) => !signatures.has(signature))
  ) {
    throw new Error("Showcase token verifier regression coverage failed");
  }
}

assertVerifierRegressionCoverage();

const files = [
  ...(await collectFiles(path.join(packageRoot, "src"))),
  ...(await collectFiles(path.join(packageRoot, ".storybook"))),
];
const findings = [];
for (const absolute of files) {
  const relative = path.relative(packageRoot, absolute).replaceAll(path.sep, "/");
  const source = await readFile(absolute, "utf8");
  findings.push(
    ...(relative.endsWith(".css")
      ? cssFindings(relative, source)
      : jsxStyleFindings(relative, source)),
  );
}

const errors = [];
if (exceptionDocument.version !== 2 || !Array.isArray(exceptionDocument.exceptions)) {
  errors.push("token-boundary-exceptions.json must use version 2 with an exceptions array");
}
const exceptions = Array.isArray(exceptionDocument.exceptions) ? exceptionDocument.exceptions : [];
const usedExceptions = new Set();
for (const [index, exception] of exceptions.entries()) {
  const required = ["file", "rule", "selector", "property", "value", "reason"];
  if (
    Object.keys(exception).some((key) => !required.includes(key)) ||
    required.some((key) => typeof exception[key] !== "string" || exception[key].trim() === "")
  ) {
    errors.push(`exception ${index + 1} must contain only non-empty ${required.join("/")}`);
  }
}

for (const item of findings) {
  const index = exceptions.findIndex(
    (exception, exceptionIndex) =>
      !usedExceptions.has(exceptionIndex) &&
      ["file", "rule", "selector", "property", "value"].every(
        (key) => exception[key] === item[key],
      ),
  );
  if (index >= 0) {
    usedExceptions.add(index);
    continue;
  }
  errors.push(
    `${item.file}:${item.line} [${item.rule}] ${item.selector} { ${item.property}: ${item.value} }`,
  );
}
for (const [index, exception] of exceptions.entries()) {
  if (!usedExceptions.has(index)) {
    errors.push(`unused exception ${index + 1}: ${exception.file} ${exception.selector} ${exception.property}`);
  }
}

if (errors.length > 0) {
  throw new Error(`Showcase token boundary failed:\n${errors.join("\n")}`);
}

console.log(
  `Verified ${findings.length} token-sensitive declarations across ${files.length} Showcase source files; ${usedExceptions.size} exact editorial/demo geometry exceptions are documented.`,
);
