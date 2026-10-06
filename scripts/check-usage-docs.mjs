#!/usr/bin/env node

// 컴포넌트 사용 지침(packages/design-contracts/docs/usage)이 공개 API 전체를 덮는지 검사하고 색인을 만든다.
// 2026-10-06 사용자 요청: 소비 앱 에이전트가 HJM을 직접 조립하지 않고 고르도록 모든 컴포넌트마다 지침을 둔다.
// 계약 문서는 결정·증거 기록이라 "언제 쓰나"를 찾기 어려웠다. 사용 지침을 계약 문서 안 절로 넣는 대안은
// 136개 계약 문서의 이력 서술과 섞이고 생성물로 검사하기 어려워서 버렸다.
// 단위는 public-component-map의 계약(canonicalComponent)이고, 계약 없는 supplemental은 이름 하나가 한 단위다.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const usageDir = resolve(root, "packages/design-contracts/docs/usage");
const indexPath = resolve(usageDir, "README.md");
const write = process.argv.includes("--write");

const REQUIRED_HEADINGS = ["## 언제 쓰나", "## 쓰지 않을 때", "## 공개 이름과 import"];

export function usageFileName(unit) {
  return `${unit
    .replace(/QRCode/, "QrCode")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()}.md`;
}

function collectUnits(map) {
  const units = new Map();
  for (const [pkg, entries] of Object.entries(map.packages)) {
    const surface = pkg === "@hjmds/react-native" ? "native" : "web";
    for (const entry of entries) {
      const key = entry.canonicalComponent ?? entry.name;
      const unit = units.get(key) ?? { web: new Set(), native: new Set() };
      unit[surface].add(entry.name);
      units.set(key, unit);
    }
  }
  return new Map([...units].sort(([a], [b]) => a.localeCompare(b)));
}

function firstSentence(markdown) {
  const section = markdown.split("## 언제 쓰나")[1]?.split(/\n## /)[0] ?? "";
  const text = section.trim().split(/\n\s*\n/)[0]?.replace(/\s*\n\s*/g, " ") ?? "";
  const end = text.search(/다\.(\s|$)/);
  return (end >= 0 ? text.slice(0, end + 2) : text).replaceAll("|", "\\|");
}

function renderIndex(rows) {
  const lines = [
    "# HJM 컴포넌트 사용 지침 색인",
    "",
    "이 파일은 `pnpm usage:sync`가 각 지침에서 생성한다. 직접 수정하지 않는다.",
    "",
    "소비 앱에서 화면을 만들기 전에 이 표에서 문제에 맞는 컴포넌트를 찾고, 그 지침의",
    "\"쓰지 않을 때\"까지 읽은 뒤 고른다. 표에 맞는 것이 없을 때만 제품에서 조합한다.",
    "설치한 버전의 지침을 본다: `node_modules/@hjmds/design-contracts/docs/usage/`.",
    "",
    "| 컴포넌트 | 언제 쓰나 | Web | Native |",
    "| --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(`| [${row.unit}](${row.file}) | ${row.summary} | ${row.web ? "O" : "—"} | ${row.native ? "O" : "—"} |`);
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const map = JSON.parse(await readFile(resolve(root, "docs/generated/public-component-map.json"), "utf8"));
  const units = collectUnits(map);
  const present = new Set((await readdir(usageDir)).filter((name) => name.endsWith(".md") && name !== "README.md"));
  const problems = [];
  const rows = [];

  for (const [unit, names] of units) {
    const file = usageFileName(unit);
    if (!present.delete(file)) {
      problems.push(`${unit}: ${file} 없음`);
      continue;
    }
    const markdown = await readFile(resolve(usageDir, file), "utf8");
    for (const heading of REQUIRED_HEADINGS) {
      if (!markdown.includes(heading)) problems.push(`${file}: "${heading}" 절 없음`);
    }
    // 묶인 companion·optional 이름이 빠지면 그 이름을 찾는 사람이 지침에 닿지 못한다.
    for (const name of new Set([...names.web, ...names.native])) {
      if (!markdown.includes(`\`${name}\``)) problems.push(`${file}: 공개 이름 \`${name}\` 언급 없음`);
    }
    rows.push({ unit, file, summary: firstSentence(markdown), web: names.web.size > 0, native: names.native.size > 0 });
  }
  for (const orphan of present) problems.push(`${orphan}: 공개 API 대응표에 없는 단위`);

  const index = renderIndex(rows);
  if (write) {
    await writeFile(indexPath, index);
  } else {
    const current = await readFile(indexPath, "utf8").catch(() => "");
    if (current !== index) problems.push("README.md 색인이 생성 결과와 다르다(pnpm usage:sync)");
  }

  if (problems.length > 0) {
    console.error(`usage docs: ${problems.length}건\n${problems.map((p) => `- ${p}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log(`usage docs: ${units.size}개 단위 확인${write ? ", 색인 갱신" : ""}`);
}

await main();
