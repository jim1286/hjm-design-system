#!/usr/bin/env node

// 사용 지침(packages/design-contracts/docs/usage)이 규격(usage/STANDARD.md)대로 공개 API와 Storybook의 네 단계를
// 모두 덮는지 검사하고 색인을 만든다.
// 2026-10-06 사용자 요청: 소비 앱 에이전트가 지침만 보고 버튼 위치·영역 배치·구성을 파악할 수 있어야 하고,
// 앞으로 만드는 토큰·컴포넌트·구성·화면은 지침을 필수로 두며, 지침은 정해진 규격으로 나와야 한다.
// 계약 문서 안에 사용 절을 넣는 대안은 이력 서술과 섞이고 형식을 검사하기 어려워 버렸다.
// 단위: 컴포넌트는 public-component-map의 계약(계약 없는 supplemental은 이름 하나). 토큰·구성·화면은 showcase의
// `<배포|실험>/<단계>/<분류>/<항목>` Storybook 제목이고, 컴포넌트 단계의 항목 제목(`컴포넌트/개요/*` 문서 제외)도
// 어느 지침이 담당해야 한다. 제목 형식 자체는 scripts/check-storybook.mjs가 검사한다.
// 규격을 바꾸면 STANDARD.md·templates/·이 파일·전체 지침을 같은 변경에서 바꾼다.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, ITEM_ORDER } from "./check-storybook.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const usageDir = resolve(root, "packages/design-contracts/docs/usage");
const indexPath = resolve(usageDir, "README.md");
const write = process.argv.includes("--write");

const HEADER_KEYS = ["단계", "상태", "지원", "적용", "검토일", "근거", "스토리북"];
const SUPPORT = new Set(["Web · Native", "Web", "Native"]);
const PLATFORM = { name: "## 플랫폼 차이", table: "| 항목 | Web | Native |" };
const PITFALLS = { name: "## 함정", optional: true };
const CODE = { code: true };

// 절 순서 그대로. optional이 아니면 필수. table은 그 절에 그대로 있어야 하는 머리 행, rows는 고정 행 이름.
export const STAGES = [
  {
    key: "tokens",
    label: "토큰",
    summary: "## 언제 쓰나",
    sections: [
      { name: "## 언제 쓰나" },
      { name: "## 값", table: "| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |" },
      { name: "## 쓰는 법", ...CODE },
      { name: "## 하지 말 것" },
      { ...PLATFORM, optional: true },
    ],
  },
  {
    key: "components",
    label: "컴포넌트",
    summary: "## 언제 쓰나",
    sections: [
      { name: "## 언제 쓰나" },
      { name: "## 쓰지 않을 때", table: "| 상황 | 대신 쓸 것 |" },
      { name: "## 공개 이름과 import", table: "| 이름 | 역할 | Web | Native |" },
      { name: "## 최소 사용 예", ...CODE },
      { name: "## 축과 기본값", optional: true, table: "| prop | 값 | 기본값 | 설명 |" },
      {
        name: "## 배치",
        table: "| 항목 | 값 | 근거 |",
        rows: ["크기", "간격", "순서·정렬", "고정·스크롤", "좁은 폭·큰 글자"],
      },
      { name: "## 꼭 지킬 것" },
      { ...PLATFORM, optional: true },
      PITFALLS,
    ],
  },
  {
    key: "compositions",
    label: "구성",
    summary: "## 언제 쓰나",
    sections: [
      { name: "## 언제 쓰나" },
      { name: "## 구성 요소", table: "| 컴포넌트 | 역할 | 지침 |" },
      { name: "## 배치", diagram: true, table: "| 영역 | 컴포넌트 | 위치 | 크기·간격 |", rows: ["바깥 틀"] },
      { name: "## 흐름과 상태", list: true, table: "| 상태 | 모습 | 포커스·알림 |", rows: ["기본", "진행 중", "실패"] },
      { name: "## 코드 골격", ...CODE },
      { ...PLATFORM, optional: true },
      PITFALLS,
    ],
  },
  {
    key: "screens",
    label: "화면",
    summary: "## 목적",
    sections: [
      { name: "## 목적" },
      { name: "## 영역 구조", diagram: true, table: "| 영역 | 컴포넌트 | 위치 | 크기·간격 |", rows: ["바깥 틀"] },
      { name: "## 버튼과 행동 위치", table: "| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |" },
      { name: "## 상태", table: "| 상태 | 화면 모습 | 행동 |", rows: ["기본", "로딩", "빈", "오류"] },
      { name: "## 사용하는 지침", table: "| 지침 | 쓰는 곳 |" },
      { name: "## 코드 골격", ...CODE },
      { name: "## 큰 글자·다크·좁은 폭", table: "| 조건 | 바뀌는 것 |" },
      { ...PLATFORM, optional: true },
      PITFALLS,
    ],
  },
];

export function usageFileName(unit) {
  return `${unit
    .replace(/QRCode/, "QrCode")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()}.md`;
}

function collectComponentUnits(map) {
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

async function walk(directory, predicate) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path, predicate)));
    else if (predicate(entry.name)) out.push(path);
  }
  return out;
}

// 템플릿 문자열 제목(`${...}`)은 같은 제목을 정적으로 선언한 Web 스토리가 있어 건너뛴다.
// 담당 대상은 모든 단계의 항목 제목(`<배포|실험>/<단계>/<분류>/<항목>`, docs/STORYBOOK_NAVIGATION.md §1)이다.
// `컴포넌트/개요/...`(사용 안내·컴포넌트 찾기·구현·검증 현황·<역할> 모아 보기)는 컴포넌트 탐색 문서라 대상이 아니다.
// 2026-10-06 규격 확정 전에는 Web 컴포넌트가 역할 묶음(깊이 3) 안의 스토리 `name`이라 `<묶음 제목>/<name>`을 담당 키로
// 만들었고, 같은 이름의 개별 제목과 키가 17개 겹쳐 어느 쪽을 담당하는지 구분하지 못했다. 같은 날 묶음 9개를
// `컴포넌트/개요/<역할> 모아 보기`로 옮기고 Web 개별 항목 84개를 만들어 이제 개별 제목만 담당 키다(옛 묶음 키 처리는 지웠다).
async function collectStories() {
  const stories = new Map();
  const files = await walk(resolve(root, "showcase"), (name) => /\.stories\.(tsx|ts|mdx)$/.test(name));
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/title:\s*"((?:배포|실험)\/(토큰|컴포넌트|구성|화면)\/[^"$]+)"/g)) {
      const required = !match[1].includes("/컴포넌트/개요/");
      const surface = file.includes("/showcase/native/") ? "native" : "web";
      const story = stories.get(match[1]) ?? { stage: match[2], required, web: false, native: false };
      story[surface] = true;
      stories.set(match[1], story);
    }
  }
  return stories;
}

function splitSections(markdown) {
  const parts = markdown.split(/\n(?=## )/);
  return parts.slice(1).map((part) => ({ name: part.split("\n")[0].trim(), body: part }));
}

function parseHeader(markdown) {
  const lines = markdown.split("\n");
  const entries = [];
  for (const line of lines.slice(1)) {
    if (line.trim() === "") {
      if (entries.length > 0) break;
      continue;
    }
    const match = line.match(/^- ([^:]+): (.+)$/);
    if (!match) break;
    entries.push([match[1], match[2].trim()]);
  }
  return entries;
}

function validate(stage, label, markdown, problems) {
  const header = parseHeader(markdown);
  const keys = header.map(([key]) => key);
  if (keys.join("|") !== HEADER_KEYS.join("|")) {
    problems.push(`${label}: 머리말 키가 ${HEADER_KEYS.join("·")} 순서가 아니다(현재 ${keys.join("·") || "없음"})`);
  }
  const values = Object.fromEntries(header);
  if (values["단계"] && values["단계"] !== stage.label) problems.push(`${label}: 단계가 ${stage.label}가 아니다`);
  if (values["상태"] && !["배포", "실험"].includes(values["상태"])) problems.push(`${label}: 상태는 배포|실험`);
  if (values["지원"] && !SUPPORT.has(values["지원"])) problems.push(`${label}: 지원은 Web · Native|Web|Native`);
  if (values["검토일"] && !/^\d{4}-\d{2}-\d{2}$/.test(values["검토일"])) problems.push(`${label}: 검토일 형식`);

  if (values["적용"] && !/^(\d+\.\d+\.\d+|미게시\(\d+\.\d+\.\d+ 이후\))$/.test(values["적용"])) {
    problems.push(`${label}: 적용은 \`x.y.z\` 또는 \`미게시(x.y.z 이후)\`(현재 ${values["적용"]})`);
  }
  // 규격 절을 `###`로 내리면 표·행 검사를 피할 수 있었다(2026-10-06 리뷰에서 10개 발견).
  for (const spec of stage.sections) {
    const demoted = `#${spec.name}`;
    if (markdown.includes(`\n${demoted}\n`)) problems.push(`${label}: 규격 절 "${spec.name}"을 ###로 내렸다`);
  }

  const sections = splitSections(markdown);
  let cursor = 0;
  for (const section of sections) {
    const index = stage.sections.findIndex((spec, i) => i >= cursor && spec.name === section.name);
    if (index < 0) {
      problems.push(`${label}: 규격에 없거나 순서가 틀린 절 "${section.name}"`);
      continue;
    }
    for (const skipped of stage.sections.slice(cursor, index)) {
      if (!skipped.optional) problems.push(`${label}: 필수 절 "${skipped.name}" 없음`);
    }
    cursor = index + 1;
    const spec = stage.sections[index];
    if (spec.table && !section.body.includes(`\n${spec.table}\n`)) problems.push(`${label}: "${spec.name}"에 표 ${spec.table} 없음`);
    for (const row of spec.rows ?? []) {
      if (!section.body.includes(`\n| ${row} |`)) problems.push(`${label}: "${spec.name}" 표에 ${row} 행 없음`);
    }
    if (spec.diagram && !section.body.includes("```text")) problems.push(`${label}: "${spec.name}"에 배치도(\`\`\`text) 없음`);
    if (spec.code && !section.body.includes("```tsx")) problems.push(`${label}: "${spec.name}"에 코드(\`\`\`tsx) 없음`);
    if (spec.code) {
      // 코드 블록 첫 줄로 플랫폼을 밝히고, 지원하는 플랫폼마다 예를 둔다(2026-10-06 리뷰: 한쪽만 있는 지침 38개).
      const platforms = [...section.body.matchAll(/```tsx\n([^\n]*)/g)].map((m) => m[1].trim());
      for (const first of platforms) {
        if (!/^\/\/ (Web|Native)\b/.test(first)) problems.push(`${label}: "${spec.name}" 코드 첫 줄이 // Web 또는 // Native가 아니다`);
      }
      const support = values["지원"] ?? "";
      for (const platform of ["Web", "Native"]) {
        if (support.includes(platform) && !platforms.some((first) => first.startsWith(`// ${platform}`))) {
          problems.push(`${label}: "${spec.name}"에 ${platform} 코드 없음(지원: ${support})`);
        }
      }
    }
    if (spec.list && !/\n1\. /.test(section.body)) problems.push(`${label}: "${spec.name}"에 번호 목록 없음`);
  }
  for (const missing of stage.sections.slice(cursor)) {
    if (!missing.optional) problems.push(`${label}: 필수 절 "${missing.name}" 없음`);
  }
  const declared = [...(values["스토리북"] ?? "").matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  // 상태는 담당 스토리의 단계와 맞아야 한다. 배포 항목이 하나라도 있으면 배포, 모두 실험이면 실험.
  if (declared.length > 0 && values["상태"]) {
    const expected = declared.some((title) => title.startsWith("배포/")) ? "배포" : "실험";
    if (values["상태"] !== expected) problems.push(`${label}: 상태가 ${expected}여야 한다(담당 스토리 기준)`);
  }
  return { values, declared };
}

function summary(markdown, heading) {
  const section = markdown.split(`\n${heading}\n`)[1]?.split(/\n## /)[0] ?? "";
  const text = section.trim().split(/\n\s*\n/)[0]?.replace(/\s*\n\s*/g, " ") ?? "";
  const end = text.search(/다\.(\s|$)/);
  // 지침 안 상대 링크는 색인 위치에서 깨지므로 글자만 남긴다.
  const sentence = (end >= 0 ? text.slice(0, end + 2) : text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return sentence.replaceAll("|", "\\|");
}

// 색인의 분류는 담당(또는 참조) Storybook 제목의 셋째 마디이고, 토큰·구성·화면은 Storybook 메뉴와 같은 분류 순서로 놓는다.
// 2026-10-06 규격에서 분류 어휘를 고정했는데 색인은 단계별 가나다 목록이라 메뉴에서 본 묶음을 색인에서 다시 찾을 수 없었다.
// 어휘는 check-storybook.mjs의 CATEGORIES 하나만 쓴다(두 곳에 적으면 어긋난다).
function categoryOf(stage, declared) {
  const own = declared.find((title) => title.split("/")[1] === stage.label);
  if (own) return own.split("/")[2];
  // 화면급 컴포넌트 API처럼 다른 단계 예제만 참조하면 그 단계까지 적는다(`화면/소통`).
  return declared[0] ? declared[0].split("/").slice(1, 3).join("/") : "—";
}

function orderRows(stage, rows) {
  if (stage.key === "components") return rows;
  const order = CATEGORIES[stage.label];
  const rank = (row) => (order.includes(row.category) ? order.indexOf(row.category) : order.length);
  // 흐름 순서가 있는 분류(화면/소개)는 storySort처럼 ITEM_ORDER를 먼저 따른다.
  const itemRank = (row) => {
    const fixed = ITEM_ORDER[`${stage.label}/${row.category}`] ?? [];
    return fixed.includes(row.name) ? fixed.indexOf(row.name) : fixed.length;
  };
  return [...rows].sort((a, b) => rank(a) - rank(b) || itemRank(a) - itemRank(b) || a.name.localeCompare(b.name, "ko"));
}

function renderIndex(sections) {
  const lines = [
    "# HJM 사용 지침 색인",
    "",
    "이 파일은 `pnpm usage:sync`가 각 지침에서 생성한다. 직접 수정하지 않는다. 지침 형식은 [규격](STANDARD.md)을 따른다.",
    "",
    "단계는 Storybook과 같은 `토큰 → 컴포넌트 → 구성 → 화면`이다. 화면을 만들 때는 화면 지침의 영역 구조와",
    "버튼 위치에서 시작해 구성·컴포넌트 지침으로 내려가고, 값은 토큰 지침에서 고른다. 표에 맞는 것이 없을 때만",
    "제품에서 조합한다. 설치한 버전의 지침을 본다: `node_modules/@hjmds/design-contracts/docs/usage/`.",
    "`분류`는 Storybook 제목 `<배포|실험>/<단계>/<분류>/<항목>`의 셋째 마디이고, 토큰·구성·화면은 Storybook 메뉴와 같은 순서다.",
  ];
  for (const { stage, rows } of sections) {
    lines.push(
      "",
      `## ${stage.label}`,
      "",
      `| 지침 | 분류 | ${stage.key === "screens" ? "목적" : "언제 쓰나"} | 상태 | 지원 |`,
      "| --- | --- | --- | --- | --- |",
    );
    for (const row of orderRows(stage, rows)) {
      lines.push(`| [${row.name}](${row.path}) | ${row.category} | ${row.summary} | ${row.status} | ${row.support} |`);
    }
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const map = JSON.parse(await readFile(resolve(root, "docs/generated/public-component-map.json"), "utf8"));
  const components = collectComponentUnits(map);
  const stories = await collectStories();
  const problems = [];
  const sections = [];
  const claimed = new Map();

  const claim = (label, stage, declared) => {
    for (const storyTitle of declared) {
      const story = stories.get(storyTitle);
      if (!story) problems.push(`${label}: 없는 Storybook 제목 ${storyTitle}`);
      // 컴포넌트 지침은 그 API를 보여 주는 구성·화면 예제를 참조할 수 있다(담당은 아님). 2026-10-06 전에는 이를 막아
      // ChatScreen·SearchScreen 등 화면급 API 지침 15개 이상이 실제 예제가 있는데도 `스토리북: 없음`이었다.
      else if (story.stage !== stage.label && stage.key === "components") continue;
      else if (story.stage !== stage.label) problems.push(`${label}: ${storyTitle}은 ${story.stage} 단계`);
      // 컴포넌트는 여러 계약을 한 스토리에서 보이는 경우가 있어 같은 제목을 함께 참조할 수 있다.
      else if (claimed.has(storyTitle) && stage.key !== "components") problems.push(`${label}: ${storyTitle}을 ${claimed.get(storyTitle)}도 담당`);
      else claimed.set(storyTitle, label);
    }
  };

  for (const stage of STAGES) {
    const directory = resolve(usageDir, stage.key);
    const files = new Set((await readdir(directory).catch(() => [])).filter((name) => name.endsWith(".md")));
    const rows = [];

    if (stage.key === "components") {
      for (const [unit, names] of components) {
        const file = usageFileName(unit);
        const label = `components/${file}`;
        if (!files.delete(file)) {
          problems.push(`${label}: ${unit} 지침 없음`);
          continue;
        }
        const markdown = await readFile(resolve(directory, file), "utf8");
        if (!markdown.startsWith(`# ${unit}\n`)) problems.push(`${label}: 제목은 "# ${unit}"`);
        const { values, declared } = validate(stage, label, markdown, problems);
        // 컴포넌트는 Storybook 항목이 없을 수 있다(보조 API). 그때 스토리북 값은 `없음`.
        if (values["스토리북"] !== "없음") claim(label, stage, declared);
        // 묶인 companion·optional 이름이 빠지면 그 이름을 찾는 사람이 지침에 닿지 못한다.
        for (const name of new Set([...names.web, ...names.native])) {
          if (!markdown.includes(`\`${name}\``)) problems.push(`${label}: 공개 이름 \`${name}\` 언급 없음`);
        }
        rows.push({ name: unit, path: label, category: categoryOf(stage, declared), summary: summary(markdown, stage.summary), status: values["상태"] ?? "", support: values["지원"] ?? "" });
      }
      for (const orphan of files) problems.push(`components/${orphan}: 공개 API 대응표에 없는 단위`);
    } else {
      for (const file of [...files].sort()) {
        const label = `${stage.key}/${file}`;
        const markdown = await readFile(resolve(directory, file), "utf8");
        const { values, declared } = validate(stage, label, markdown, problems);
        if (declared.length === 0) problems.push(`${label}: 스토리북 제목 없음`);
        claim(label, stage, declared);
        const name = markdown.match(/^# (.+)$/m)?.[1] ?? file;
        rows.push({ name, path: label, category: categoryOf(stage, declared), summary: summary(markdown, stage.summary), status: values["상태"] ?? "", support: values["지원"] ?? "" });
      }
    }
    sections.push({ stage, rows });
  }

  for (const [storyTitle, story] of stories) {
    if (story.required && !claimed.has(storyTitle)) problems.push(`Storybook ${storyTitle}(${story.stage}) 담당 지침 없음`);
  }

  const index = renderIndex(sections);
  if (write) {
    await writeFile(indexPath, index);
  } else {
    const current = await readFile(indexPath, "utf8").catch(() => "");
    if (current !== index) problems.push(`${relative(root, indexPath)} 색인이 생성 결과와 다르다(pnpm usage:sync)`);
  }

  if (problems.length > 0) {
    console.error(`usage docs: ${problems.length}건\n${problems.map((p) => `- ${p}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  const counts = sections.map(({ stage, rows }) => `${stage.label} ${rows.length}`).join(", ");
  console.log(`usage docs: ${counts}${write ? ", 색인 갱신" : ""}`);
}

await main();
