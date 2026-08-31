#!/usr/bin/env node

import { lstat, readFile, readdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRoot = resolve(scriptDirectory, "..");
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "storybook-static",
]);

function isInside(rootPath, candidatePath) {
  const fromRoot = relative(rootPath, candidatePath);
  return fromRoot === ""
    || (!fromRoot.startsWith(`..${sep}`) && fromRoot !== ".." && !isAbsolute(fromRoot));
}

async function collectMarkdownFiles(rootPath) {
  const files = [];
  const queue = [rootPath];
  while (queue.length > 0) {
    const directory = queue.shift();
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) continue;
        queue.push(absolutePath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
        files.push(absolutePath);
      }
    }
  }
  return files.sort();
}

function markdownDestinations(source) {
  const destinations = [];
  const pattern = /!?(?:\[[^\]]*\])\(([^)]+)\)/g;
  for (const match of source.matchAll(pattern)) {
    let destination = match[1]?.trim() ?? "";
    if (destination.startsWith("<")) {
      const closing = destination.indexOf(">");
      if (closing >= 0) destination = destination.slice(1, closing);
    } else {
      destination = destination.split(/\s+["']/u, 1)[0] ?? "";
    }
    destinations.push({
      destination,
      line: source.slice(0, match.index).split("\n").length,
    });
  }
  return destinations;
}

export async function checkDocLinks({ rootPath = defaultRoot } = {}) {
  const absoluteRoot = resolve(rootPath);
  const findings = [];
  const files = await collectMarkdownFiles(absoluteRoot);

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const sourceLabel = relative(absoluteRoot, filePath);
    for (const { destination, line } of markdownDestinations(source)) {
      if (!destination || destination.startsWith("#")) continue;
      if (/^(?:https?|mailto):/iu.test(destination)) continue;

      const rawPath = destination.split("#", 1)[0]?.split("?", 1)[0] ?? "";
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(rawPath);
      } catch {
        findings.push({
          code: "LINK_ENCODING_INVALID",
          path: `${sourceLabel}:${line}`,
          message: `Local link has invalid percent encoding: ${destination}`,
        });
        continue;
      }
      if (isAbsolute(decodedPath)) {
        findings.push({
          code: "ABSOLUTE_LOCAL_LINK",
          path: `${sourceLabel}:${line}`,
          message: `Local Markdown links must be repository-relative: ${destination}`,
        });
        continue;
      }

      const targetPath = resolve(dirname(filePath), decodedPath || ".");
      if (!isInside(absoluteRoot, targetPath)) {
        findings.push({
          code: "LINK_ESCAPES_ROOT",
          path: `${sourceLabel}:${line}`,
          message: `Local link escapes the design-system repository: ${destination}`,
        });
        continue;
      }

      try {
        const stat = await lstat(targetPath);
        if (stat.isSymbolicLink()) {
          findings.push({
            code: "LINK_TARGET_SYMLINK",
            path: `${sourceLabel}:${line}`,
            message: `Local documentation target must not be a symlink: ${destination}`,
          });
        }
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        findings.push({
          code: "LINK_TARGET_MISSING",
          path: `${sourceLabel}:${line}`,
          message: `Local documentation target does not exist: ${destination}`,
        });
      }
    }
  }

  return { ok: findings.length === 0, filesChecked: files.length, findings };
}

async function main(argv) {
  let rootPath = defaultRoot;
  let json = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") {
      rootPath = argv[index + 1];
      index += 1;
    } else if (argument === "--json") {
      json = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (!rootPath) throw new Error("--root requires a path.");

  const result = await checkDocLinks({ rootPath });
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.ok) {
    process.stdout.write(`documentation links: ready (${result.filesChecked} Markdown files)\n`);
  } else {
    process.stderr.write(`documentation links: ${result.findings.length} finding(s)\n`);
    for (const item of result.findings) {
      process.stderr.write(`  - [${item.code}] ${item.path}: ${item.message}\n`);
    }
  }
  process.exitCode = result.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
