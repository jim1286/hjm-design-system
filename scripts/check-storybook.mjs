#!/usr/bin/env node

// Storybook 탐색 규격(docs/STORYBOOK_NAVIGATION.md)을 Web·Native 스토리 소스에서 정적으로 검사한다.
// 2026-10-06 사용자 결정: "스토리북 규격도 잡아줘. 지금 좀 난잡해" → 제목을 `<배포|실험>/<단계>/<분류>/<항목>` 4마디로
// 고정하고 분류·스토리 이름을 고정 어휘로 둔다. 그전에는 같은 단계 안에서 깊이 3·4·5가 섞였고, 항목 1개짜리 폴더가 12개,
// 같은 export(Empty·Recovery)가 파일마다 다른 뜻으로 쓰였다. 항목별 제목을 하드코딩한 테스트
// (showcase/native/src/component-stories.test.ts)는 승격 때마다 깨져 규칙 대신 목록을 지켰으므로 이 규칙 검사로 대체한다.
// 렌더·기기 확인은 하지 않는다. 빌드 index 기준 정규 103개 검사는 showcase/web/scripts/verify-static.mjs가 계속 맡는다.
//
// 사용: node scripts/check-storybook.mjs            # 검사(쓰지 않음, CI와 `pnpm storybook:check`)
//       node scripts/check-storybook.mjs --write-ids # 새 Web story id만 showcase/web/story-ids.json에 추가
// --write-ids는 지운 id를 목록에서 빼지 않는다. 지운 id는 사람이 `retired`에 대체 id와 함께 옮긴다(링크 호환 기록).

import { readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = resolve(root, "showcase/web/story-ids.json");

// ── 규격 상수. 바꾸면 docs/STORYBOOK_NAVIGATION.md §1과 두 preview.tsx의 storySort를 같은 변경에서 고친다. ──

export const ROOTS = ["배포", "실험"];
export const STAGES = ["토큰", "컴포넌트", "구성", "화면"];
// 분류는 "사용자가 그 항목으로 하는 일"로 고른다. 출처·작업 묶음 이름(공통 화면·기본 흐름·상호작용 예제)은
// 승격 때마다 재분류를 낳아 버렸다(2026-10-06 실측: 둘째 분류 19개 중 12개가 항목 1개).
export const CATEGORIES = {
  토큰: ["색과 글자", "공간과 크기", "표면과 움직임", "편집 도구"],
  컴포넌트: ["개요", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"],
  구성: ["입력과 작성", "선택과 필터", "탐색과 이동", "정보 표시", "피드백과 복구", "직접 조작과 모션", "비교와 검증"],
  화면: ["소개", "계정", "설정", "검색", "콘텐츠", "소통", "화면 틀과 도구"],
};
const GROUP_ROLES = ["글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "기반 기능"];
// 분류 안 항목 순서를 정하는 곳. 나머지 분류는 storySort method alphabetical(ko)로 가나다순이다.
export const ITEM_ORDER = {
  "컴포넌트/개요": ["사용 안내", "컴포넌트 찾기", "구현·검증 현황", ...GROUP_ROLES.map((role) => `${role} 모아 보기`)],
  "화면/소개": ["서비스 소개", "온보딩", "권한 안내"],
};
// 문서 항목 분류. 스토리 이름 어휘·필수 변형 검사와 사용 지침 담당 대상에서 뺀다.
export const DOC_CATEGORIES = new Set(["컴포넌트/개요"]);

export function expectedStorySort() {
  const layers = STAGES.flatMap((stage) => [
    stage,
    CATEGORIES[stage].flatMap((category) => {
      const items = ITEM_ORDER[`${stage}/${category}`];
      return items ? [category, items] : [category];
    }),
  ]);
  return { method: "alphabetical", locales: "ko", order: ["배포", layers, "실험", layers, "*"] };
}

// 항목 이름 금지어: 출처·작업명·실험명·기술명. 2026-10-06 정리 전 제목에 남아 있던 것(공통 화면, 기본 흐름, 상호작용 예제,
// Expo 인터랙션 복구, STEA·Reference 파일 접두사)이 메뉴에서 성격 대신 출처를 말했다.
export const FORBIDDEN_ITEM_WORDS = ["공통", "기본 흐름", "레퍼런스", "참고", "상호작용 예제", "용도별", "예제", "데모", "연구", "실험", "스튜디오", "인스타그램", "엑스포"];
const PLATFORM_WORDS = /웹|네이티브|iOS|안드로이드/;
const PLATFORM_CATEGORY = "구성/비교와 검증";
const MAX_ITEM_LENGTH = 16;

// 스토리 이름 고정 어휘. export와 표시 이름은 1:1이다. 순서: 기본 → 상태 → 어두운 테마 → 큰 글자 → 환경 → 조합 → 실패와 복구.
export const RESERVED_STORIES = {
  Default: "기본",
  Loading: "불러오는 중",
  Pending: "처리 중",
  Empty: "비어 있음",
  NoResults: "결과 없음",
  Error: "오류",
  Failed: "실패 후 입력 유지",
  Restricted: "로그인 필요",
  Disabled: "비활성",
  Playground: "직접 조작",
  Dark: "어두운 테마",
  LargeText: "큰 글자",
  ReducedMotion: "동작 줄이기",
  Rtl: "오른쪽에서 왼쪽",
  Recovery: "실패와 복구",
};
const STATE_ORDER = ["Loading", "Pending", "Empty", "NoResults", "Error", "Failed", "Restricted", "Disabled", "Playground"];
// 환경은 globals로만 바꾼다(args·render 안 Provider 금지). 키는 두 플랫폼이 같다: 2026-10-06 전에는 움직임이 Web `motion`,
// Native `reducedMotion`이라 같은 스토리 코드를 쓸 수 없었다.
export const ENVIRONMENTS = {
  Dark: { key: "theme", value: "dark" },
  LargeText: { key: "textScale", value: "2" },
  ReducedMotion: { key: "motion", value: "reduced" },
  Rtl: { key: "direction", value: "rtl" },
};
export const GLOBAL_TYPES = {
  theme: ["light", "dark"],
  direction: ["ltr", "rtl"],
  textScale: ["1", "1.5", "2"],
  motion: ["full", "reduced"],
};
// Storybook viewport addon의 내장 global. Web에서만 쓴다.
const EXTRA_STORY_GLOBALS = { web: new Set(["viewport"]), native: new Set() };
const ENV_ARG_KEYS = new Set(["theme", "textScale", "direction", "motion", "reducedMotion", "dark"]);
const BRAND_PREFIX = "제품 색 · ";

// 한쪽 플랫폼에만 있는 항목(단계/분류/항목, 루트 제외)과 이유. 목록에 없는 차이와 낡은 항목은 실패다.
const WEB_DOCS = "Web Storybook의 컴포넌트 탐색 문서. Native 앱 메뉴는 개별 항목만 둔다";
const WEB_API = "Web 전용 공개 API(사용 지침 지원: Web)";
const NATIVE_API = "Native 전용 공개 API(사용 지침 지원: Native)";
export const PLATFORM_ONLY = {
  web: {
    "컴포넌트/개요/사용 안내": WEB_DOCS,
    "컴포넌트/개요/컴포넌트 찾기": WEB_DOCS,
    "컴포넌트/개요/구현·검증 현황": WEB_DOCS,
    ...Object.fromEntries(GROUP_ROLES.map((role) => [`컴포넌트/개요/${role} 모아 보기`, `${WEB_DOCS}. 2026-10-06 이전 역할 묶음 URL(id) 보존용`])),
    "컴포넌트/글자와 아이콘/글자 서식": WEB_API,
    "컴포넌트/레이아웃/분할 영역 조절": WEB_API,
    "컴포넌트/데이터 표시/데이터 표": WEB_API,
    "컴포넌트/데이터 표시/트리 목록": WEB_API,
    "컴포넌트/상태와 알림/워터마크": WEB_API,
    "컴포넌트/기반 기능/고정 배치": WEB_API,
    "컴포넌트/기반 기능/본문 바로가기": WEB_API,
    "컴포넌트/기반 기능/화면 읽기 도구용 글자": WEB_API,
    "컴포넌트/입력/색상 선택기": WEB_API,
    "컴포넌트/오버레이/명령 검색": WEB_API,
    "컴포넌트/탐색/문서 내 바로가기": WEB_API,
    "컴포넌트/탐색/사이드바": WEB_API,
    "컴포넌트/탐색/사이드바 전환": WEB_API,
    "컴포넌트/탐색/이동 경로": WEB_API,
    "컴포넌트/탐색/페이지 이동": WEB_API,
    "컴포넌트/탐색/상황별 메뉴": WEB_API,
    "컴포넌트/탐색/메뉴 막대": WEB_API,
    "컴포넌트/오버레이/사용 안내 둘러보기": WEB_API,
    "컴포넌트/오버레이/측면 패널": WEB_API,
    "컴포넌트/오버레이/팝오버": WEB_API,
    "컴포넌트/오버레이/툴팁": WEB_API,
    "구성/탐색과 이동/보관함과 페이지 이동": "넓은 화면 사이드바·이동 경로·페이지 이동 조합. 구성 요소가 Web 전용 API다",
    "구성/탐색과 이동/펼침과 메뉴": "포인터 메뉴·데스크톱 메뉴 막대 조합. 구성 요소가 Web 전용 API다",
    "구성/직접 조작과 모션/숫자 변화와 메뉴 변형": "Web 모션 연동 예제. Native 대응은 끌기·밀기·화면 전환과 이미지·시트·키보드 조작이 맡는다",
    "구성/비교와 검증/웹 전용 보조 컴포넌트": "Web 전용 API 모음 자체가 대상이다",
    "구성/비교와 검증/토스트 배치 비교": "Web Toast 배치 비교. Native는 컴포넌트 항목 토스트·리퀴드 토스트에서 본다",
    "구성/비교와 검증/환경 조합 검증": "Web 브라우저 환경 조합(테마·방향·글자·움직임) 증거 표",
    "화면/화면 틀과 도구/목업 편집": "Web 작성 도구. 통합 계획이 Native runtime UI 밖에 두기로 했다(docs/plans 참조)",
  },
  native: {
    "컴포넌트/입력/단계별 선택": NATIVE_API,
    "컴포넌트/상태와 알림/리퀴드 토스트": "Native 선택 설치 확장(enhanced Toast). Web Toast에는 같은 표현이 없다",
    "구성/비교와 검증/네이티브 컴포넌트 기기 확인": "Native renderer를 기기에서 한 화면에 모아 보는 확인용 항목",
    "구성/피드백과 복구/중단해도 남는 현재 상태": "Expo 앱 생명주기(백그라운드·복귀) 복구. Web에는 같은 생명주기가 없다",
    "구성/직접 조작과 모션/이미지·시트·키보드 조작": "Native 선택 설치 adapter(ImageViewer·GestureSheet·KeyboardDock)",
  },
};

// ── 소스 파싱 ──

const showcaseRequire = createRequire(resolve(root, "showcase/web/package.json"));
let tsModule;
function typescript() {
  tsModule ??= showcaseRequire("typescript");
  return tsModule;
}
let csfModule;
async function csf() {
  csfModule ??= await import(pathToFileURL(showcaseRequire.resolve("storybook/internal/csf")).href);
  return csfModule;
}

function unwrap(node) {
  const ts = typescript();
  let current = node;
  while (current && (ts.isSatisfiesExpression(current) || ts.isAsExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.expression;
  }
  return current;
}

function propertyName(ts, property, ast) {
  if (!property.name) return undefined;
  if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) return property.name.text;
  return property.name.getText(ast);
}

// 리터럴만 평가한다. 알 수 없는 값은 UNKNOWN으로 남겨 해당 검사에서 실패시킨다.
const UNKNOWN = Symbol("unknown");
function evaluate(node, context) {
  const ts = typescript();
  const value = unwrap(node);
  if (!value) return UNKNOWN;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(value)) return value.elements.map((element) => evaluate(element, context));
  if (ts.isObjectLiteralExpression(value)) {
    const out = {};
    for (const property of value.properties) {
      if (ts.isPropertyAssignment(property)) out[propertyName(ts, property, context.ast)] = evaluate(property.initializer, context);
      else if (ts.isShorthandPropertyAssignment(property)) out[property.name.text] = UNKNOWN;
      else if (ts.isSpreadAssignment(property)) {
        const spread = context.resolveSpread?.(property.expression);
        if (spread && typeof spread === "object") Object.assign(out, spread);
      }
    }
    return out;
  }
  return UNKNOWN;
}

export async function parseStoryFile(source, file) {
  const ts = typescript();
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();
  const exported = [];
  let metaNode;
  const isExported = (node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  for (const statement of ast.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        constants.set(declaration.name.text, declaration.initializer);
        if (isExported(statement)) exported.push({ name: declaration.name.text, initializer: declaration.initializer });
      }
    } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && isExported(statement) && statement.name) {
      exported.push({ name: statement.name.text, initializer: undefined });
    } else if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const target = unwrap(statement.expression);
      metaNode = ts.isIdentifier(target) ? unwrap(constants.get(target.text)) : target;
    }
  }
  const objectOf = (initializer) => {
    const value = unwrap(initializer);
    return value && ts.isObjectLiteralExpression(value) ? value : undefined;
  };
  const metaObject = metaNode && ts.isObjectLiteralExpression(metaNode) ? metaNode : undefined;
  const meta = metaObject ? evaluate(metaObject, { ast }) : {};
  const stringList = (value) => (Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : undefined);
  const includeStories = stringList(meta.includeStories);
  const excludeStories = stringList(meta.excludeStories) ?? [];
  const storyNames = exported
    .map(({ name }) => name)
    .filter((name) => name !== "__namedExportsOrder" && !excludeStories.includes(name) && (!includeStories || includeStories.includes(name)));
  const byName = new Map(exported.map((entry) => [entry.name, entry]));
  const storyObjects = new Map();
  const resolveStory = (name, seen = new Set()) => {
    if (storyObjects.has(name)) return storyObjects.get(name);
    if (seen.has(name)) return {};
    seen.add(name);
    const object = objectOf(byName.get(name)?.initializer ?? constants.get(name));
    const context = {
      ast,
      resolveSpread(expression) {
        if (ts.isIdentifier(expression)) return resolveStory(expression.text, seen);
        if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
          const base = resolveStory(expression.expression.text, seen);
          return base?.[expression.name.text];
        }
        return undefined;
      },
    };
    const value = object ? evaluate(object, context) : {};
    const render = object?.properties.find((property) => propertyName(ts, property, ast) === "render");
    if (render) value.__render = render.getText(ast);
    storyObjects.set(name, value);
    return value;
  };
  const stories = storyNames.map((name) => {
    const value = resolveStory(name);
    return {
      exportName: name,
      name: typeof value.name === "string" ? value.name : null,
      globals: value.globals && typeof value.globals === "object" ? value.globals : {},
      argKeys: value.args && typeof value.args === "object" ? Object.keys(value.args) : [],
      render: value.__render ?? null,
    };
  });
  const objectExports = exported.filter(({ initializer }) => objectOf(initializer)).map(({ name }) => name);
  return {
    title: typeof meta.title === "string" ? meta.title : null,
    id: typeof meta.id === "string" ? meta.id : null,
    hasMeta: Boolean(metaObject),
    includeStories: includeStories ?? null,
    hasIncludeStories: Object.hasOwn(meta, "includeStories"),
    excludeStories,
    objectExports,
    stories,
  };
}

function findProperty(ast, name) {
  const ts = typescript();
  let found;
  const visit = (node) => {
    if (found) return;
    if (ts.isPropertyAssignment(node) && propertyName(ts, node, ast) === name) found = node.initializer;
    else ts.forEachChild(node, visit);
  };
  visit(ast);
  return found;
}

export function parsePreview(source, file) {
  const ts = typescript();
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const storySort = findProperty(ast, "storySort");
  const globalTypes = findProperty(ast, "globalTypes");
  const types = {};
  const value = globalTypes ? evaluate(globalTypes, { ast }) : {};
  for (const [key, spec] of Object.entries(value ?? {})) {
    const items = spec?.toolbar?.items;
    types[key] = Array.isArray(items) ? items.map((item) => item?.value) : [];
  }
  return { storySort: storySort ? evaluate(storySort, { ast }) : null, globalTypes: types };
}

async function walk(directory) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith(".stories.tsx")) out.push(path);
  }
  return out;
}

export async function webStoryIds(file) {
  const { toId, storyNameFromExport } = await csf();
  const base = file.id ?? file.title;
  return file.stories.map((story) => toId(base, storyNameFromExport(story.exportName)));
}

export async function collectModel(repositoryRoot = root) {
  const files = [];
  for (const platform of ["web", "native"]) {
    for (const path of (await walk(resolve(repositoryRoot, "showcase", platform, "src"))).sort()) {
      const parsed = await parseStoryFile(await readFile(path, "utf8"), path);
      files.push({ platform, path: relative(repositoryRoot, path), ...parsed });
    }
  }
  const previews = {
    web: parsePreview(await readFile(resolve(repositoryRoot, "showcase/web/.storybook/preview.tsx"), "utf8"), "web-preview.tsx"),
    native: parsePreview(await readFile(resolve(repositoryRoot, "showcase/native/.rnstorybook/preview.tsx"), "utf8"), "native-preview.tsx"),
  };
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8").catch(() => "null"));
  return { files, previews, snapshot };
}

// ── 규칙 ──

const hasKorean = (text) => /[가-힣]/.test(text);

function storyGroup(exportName, exportNames) {
  if (exportName === "Default") return 1;
  if (exportName === "Dark") return 3;
  if (exportName === "LargeText") return 4;
  if (exportName === "ReducedMotion" || exportName === "Rtl") return 5;
  if (exportName === "Recovery") return 7;
  if (exportName.startsWith("Brand")) return 6;
  for (const suffix of Object.keys(ENVIRONMENTS)) {
    if (exportName.endsWith(suffix) && exportName !== suffix) return 6;
  }
  void exportNames;
  return 2;
}

function checkStories(file, label, problems) {
  const names = new Map(file.stories.map((story) => [story.exportName, story.name]));
  const exportsList = file.stories.map((story) => story.exportName);
  for (const required of ["Default", "Dark", "LargeText"]) {
    if (!names.has(required)) problems.push(`S4 ${label}: 필수 스토리 ${required}(${RESERVED_STORIES[required]}) 없음`);
  }
  if (exportsList[0] !== undefined && exportsList[0] !== "Default") problems.push(`S4 ${label}: 첫 스토리가 Default(기본)가 아니다(${exportsList[0]})`);
  let previousGroup = 0;
  let previousState = -1;
  let previousEnvironment = -1;
  for (const story of file.stories) {
    const where = `${label} ${story.exportName}`;
    if (!story.name || !hasKorean(story.name)) problems.push(`S4 ${where}: 한글 표시 이름(name 리터럴) 없음`);
    const reserved = RESERVED_STORIES[story.exportName];
    if (reserved && story.name !== reserved) problems.push(`S4 ${where}: 표시 이름은 "${reserved}"(현재 "${story.name}")`);
    if (!reserved && Object.values(RESERVED_STORIES).includes(story.name)) {
      const owner = Object.entries(RESERVED_STORIES).find(([, value]) => value === story.name)[0];
      problems.push(`S4 ${where}: "${story.name}"은 ${owner} 전용 이름이다. export를 ${owner}로 바꾸거나 다른 이름을 쓴다`);
    }
    const group = storyGroup(story.exportName, exportsList);
    if (group < previousGroup) problems.push(`S4 ${where}: 순서는 기본 → 상태 → 어두운 테마 → 큰 글자 → 환경 → 조합 → 실패와 복구`);
    previousGroup = Math.max(previousGroup, group);
    if (group === 2 && STATE_ORDER.includes(story.exportName)) {
      const index = STATE_ORDER.indexOf(story.exportName);
      if (index < previousState) problems.push(`S4 ${where}: 상태 순서는 ${STATE_ORDER.join(" → ")}`);
      previousState = Math.max(previousState, index);
    }
    if (group === 5) {
      const index = ["ReducedMotion", "Rtl"].indexOf(story.exportName);
      if (index < previousEnvironment) problems.push(`S4 ${where}: 환경 순서는 ReducedMotion → Rtl`);
      previousEnvironment = Math.max(previousEnvironment, index);
    }
    const environment = ENVIRONMENTS[story.exportName];
    if (environment && story.globals[environment.key] !== environment.value) {
      problems.push(`S7 ${where}: globals.${environment.key}: "${environment.value}"로 바꿔야 한다`);
    }
    if (group === 6) {
      if (story.exportName.startsWith("Brand") && !story.name?.startsWith(BRAND_PREFIX)) {
        problems.push(`S4 ${where}: 제품 팔레트 스토리 이름은 "${BRAND_PREFIX}<색>"으로 시작한다`);
      }
      const suffix = Object.keys(ENVIRONMENTS).find((key) => story.exportName.endsWith(key) && story.exportName !== key);
      if (suffix) {
        const env = ENVIRONMENTS[suffix];
        const base = story.exportName.slice(0, -suffix.length);
        const expected = names.has(base) ? `${names.get(base)} · ${RESERVED_STORIES[suffix]}` : null;
        if (expected && story.name !== expected) problems.push(`S4 ${where}: 조합 이름은 "${expected}"`);
        if (!expected && !story.name?.endsWith(` · ${RESERVED_STORIES[suffix]}`)) problems.push(`S4 ${where}: 조합 이름은 "<상태> · ${RESERVED_STORIES[suffix]}"`);
        if (story.globals[env.key] !== env.value) problems.push(`S7 ${where}: globals.${env.key}: "${env.value}"가 없다`);
      }
    }
    for (const key of Object.keys(story.globals)) {
      if (!(key in GLOBAL_TYPES) && !EXTRA_STORY_GLOBALS[file.platform].has(key)) problems.push(`S7 ${where}: 알 수 없는 global 키 ${key}(허용: ${Object.keys(GLOBAL_TYPES).join("·")})`);
    }
    for (const key of story.argKeys) {
      if (ENV_ARG_KEYS.has(key)) problems.push(`S7 ${where}: 환경(${key})을 args로 바꾸지 않는다. globals를 쓴다`);
    }
    if (story.render && /<(?:Hjm\w*Provider|WebDesignSystemProvider)\b[^>]*\b(?:theme|textScale|direction|reducedMotion)=/.test(story.render)) {
      problems.push(`S7 ${where}: render 안 Provider로 환경을 바꾸지 않는다. globals를 쓴다`);
    }
  }
}

export async function checkModel(model) {
  const problems = [];
  const items = new Map();
  const titleSets = { web: new Map(), native: new Map() };
  const webIds = new Map();
  const currentStoryIds = new Set();

  for (const file of model.files) {
    const label = `${file.path}`;
    if (!file.hasMeta || !file.title) {
      problems.push(`S1 ${label}: meta title을 읽지 못했다(문자열 리터럴 title이 있는 default export가 필요)`);
      continue;
    }
    const parts = file.title.split("/");
    const [rootName, stage, category, item] = parts;
    if (parts.length !== 4) problems.push(`S1 ${label}: 제목은 정확히 4마디 <배포|실험>/<단계>/<분류>/<항목>(현재 ${parts.length}마디 "${file.title}")`);
    if (!ROOTS.includes(rootName)) problems.push(`S1 ${label}: 첫 마디는 배포|실험`);
    if (!STAGES.includes(stage)) problems.push(`S1 ${label}: 둘째 마디는 ${STAGES.join("|")}`);
    if (parts.length === 4 && STAGES.includes(stage)) {
      if (!CATEGORIES[stage].includes(category)) problems.push(`S2 ${label}: ${stage} 분류 "${category}"는 어휘에 없다(${CATEGORIES[stage].join("·")})`);
      if (item === category) problems.push(`S2 ${label}: 항목 이름이 분류 이름과 같다`);
      if (!hasKorean(item) || /[A-Za-z]/.test(item)) problems.push(`S3 ${label}: 항목 이름은 영문 없이 한글로 쓴다("${item}")`);
      for (const word of FORBIDDEN_ITEM_WORDS) if (item.includes(word)) problems.push(`S3 ${label}: 항목 이름에 출처·작업명 "${word}"`);
      if (PLATFORM_WORDS.test(item) && `${stage}/${category}` !== PLATFORM_CATEGORY) problems.push(`S3 ${label}: 플랫폼 이름은 ${PLATFORM_CATEGORY} 항목에만 쓴다`);
      if ([...item].length > MAX_ITEM_LENGTH) problems.push(`S3 ${label}: 항목 이름은 ${MAX_ITEM_LENGTH}자 이하("${item}")`);
      const key = `${stage}/${category}/${item}`;
      const entry = items.get(item) ?? { keys: new Set(), roots: new Map() };
      entry.keys.add(key);
      const rootSet = entry.roots.get(key) ?? new Set();
      rootSet.add(rootName);
      entry.roots.set(key, rootSet);
      items.set(item, entry);
      const platformTitles = titleSets[file.platform];
      if (platformTitles.has(file.title)) problems.push(`S1 ${label}: ${file.platform} 제목 중복(${platformTitles.get(file.title)})`);
      platformTitles.set(file.title, file.path);
      if (!DOC_CATEGORIES.has(`${stage}/${category}`)) checkStories(file, label, problems);
    }
    // S5 meta
    if (file.platform === "web") {
      if (!file.id) problems.push(`S5 ${label}: Web meta id가 없다(URL 보존 키, 필수)`);
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(file.id)) problems.push(`S5 ${label}: Web meta id는 ASCII kebab("${file.id}")`);
      else if (webIds.has(file.id)) problems.push(`S5 ${label}: Web meta id 중복 ${file.id}(${webIds.get(file.id)})`);
      if (file.id) webIds.set(file.id, file.path);
      for (const id of await webStoryIds(file)) {
        if (currentStoryIds.has(id)) problems.push(`S5 ${label}: Web story id 중복 ${id}`);
        currentStoryIds.add(id);
      }
    } else if (file.id) {
      problems.push(`S5 ${label}: Native meta에는 id를 쓰지 않는다(Native 10.4.4 runtime이 무시해 제목과 어긋난다)`);
    }
    // Native 10.4.4 prepareStories filters the default export through this list,
    // then processCSFFile crashes on missing metadata. Remove when its import-map
    // implementation preserves default metadata independently (2026-10-07 Expo Go).
    if (file.platform === "native" && file.hasIncludeStories) {
      problems.push(`S5 ${label}: Native includeStories는 default metadata를 제거한다(10.4.4). helper를 preview 모듈로 옮기고 includeStories를 생략한다`);
    }
    if (file.includeStories) {
      for (const name of file.includeStories) if (!file.stories.some((story) => story.exportName === name)) problems.push(`S5 ${label}: includeStories의 ${name} export가 없다`);
      for (const name of file.objectExports) {
        if (!file.includeStories.includes(name) && !file.excludeStories.includes(name)) problems.push(`S5 ${label}: 스토리 객체 ${name}이 includeStories에서 빠져 메뉴에 보이지 않는다`);
      }
    }
  }

  // S2 분류당 항목 2개 이상(두 플랫폼·두 루트 합산). S3 이름 유일, 같은 항목이 배포와 실험에 동시에 있으면 안 된다.
  const perCategory = new Map();
  for (const [name, entry] of items) {
    if (entry.keys.size > 1) problems.push(`S3 항목 이름 "${name}"이 여러 곳에 있다: ${[...entry.keys].join(", ")}`);
    for (const [key, roots] of entry.roots) {
      if (roots.size > 1) problems.push(`S1 ${key}: 배포와 실험에 동시에 있다`);
      const category = key.split("/").slice(0, 2).join("/");
      perCategory.set(category, (perCategory.get(category) ?? 0) + 1);
    }
  }
  for (const [category, count] of perCategory) {
    if (count < 2) problems.push(`S2 ${category}: 항목이 ${count}개다. 항목 1개짜리 분류는 두지 않는다(다른 분류로 옮기거나 같은 항목의 스토리로 합친다)`);
  }
  for (const [key, list] of Object.entries(ITEM_ORDER)) {
    for (const name of list) if (!items.get(name)?.keys.has(`${key}/${name}`)) problems.push(`S8 ITEM_ORDER ${key}/${name}: 없는 항목`);
  }

  // S6 Web/Native 제목 동등성(루트 제외 비교)
  const rootless = (title) => title.split("/").slice(1).join("/");
  const sets = Object.fromEntries(Object.entries(titleSets).map(([platform, map]) => [platform, new Set([...map.keys()].map(rootless))]));
  for (const [platform, other] of [["web", "native"], ["native", "web"]]) {
    for (const key of sets[platform]) {
      if (!sets[other].has(key) && !PLATFORM_ONLY[platform][key]) problems.push(`S6 ${key}: ${platform}에만 있다. 다른 플랫폼에도 같은 제목을 두거나 PLATFORM_ONLY에 이유와 함께 적는다`);
    }
    for (const key of Object.keys(PLATFORM_ONLY[platform])) {
      if (!sets[platform].has(key) || sets[other].has(key)) problems.push(`S6 PLATFORM_ONLY.${platform} "${key}": 낡은 예외(${!sets[platform].has(key) ? "항목 없음" : "두 플랫폼 모두 있음"})`);
    }
  }

  // S7 툴바 globals, S8 storySort
  const expected = expectedStorySort();
  for (const [platform, preview] of Object.entries(model.previews)) {
    const keys = Object.keys(preview.globalTypes);
    if (keys.join("|") !== Object.keys(GLOBAL_TYPES).join("|")) problems.push(`S7 ${platform} preview: globalTypes 키는 ${Object.keys(GLOBAL_TYPES).join("·")} 순서(현재 ${keys.join("·")})`);
    for (const [key, values] of Object.entries(GLOBAL_TYPES)) {
      if (preview.globalTypes[key] && JSON.stringify(preview.globalTypes[key]) !== JSON.stringify(values)) problems.push(`S7 ${platform} preview: ${key} 값은 ${values.join("·")}`);
    }
    if (JSON.stringify(preview.storySort) !== JSON.stringify(expected)) problems.push(`S8 ${platform} preview: storySort가 규격과 다르다(${JSON.stringify(expected).slice(0, 120)}…)`);
  }

  // S5 Web story id 불변: 스냅숏의 active는 모두 있어야 하고, 지운 id는 retired에 현재 있는 대체 id와 함께 적는다.
  const snapshot = model.snapshot;
  const newIds = [];
  if (!snapshot) problems.push(`S5 ${relative(root, snapshotPath)} 없음(node scripts/check-storybook.mjs --write-ids)`);
  else {
    const active = new Set(snapshot.active ?? []);
    const retired = snapshot.retired ?? {};
    for (const id of active) {
      if (id in retired) problems.push(`S5 story id ${id}: active와 retired에 동시에 있다`);
      else if (!currentStoryIds.has(id)) problems.push(`S5 story id ${id}: 사라졌다. 대체 id와 함께 retired로 옮긴다(Web URL 보존)`);
    }
    for (const [id, record] of Object.entries(retired)) {
      if (currentStoryIds.has(id)) problems.push(`S5 retired ${id}: 아직 소스에 있다`);
      const replacement = record?.replacement;
      if (!replacement || !currentStoryIds.has(replacement)) problems.push(`S5 retired ${id}: 대체 id ${replacement ?? "없음"}가 현재 소스에 없다`);
    }
    for (const id of currentStoryIds) if (!active.has(id)) newIds.push(id);
    if (newIds.length > 0) problems.push(`S5 새 Web story id ${newIds.length}개가 스냅숏에 없다(node scripts/check-storybook.mjs --write-ids): ${newIds.slice(0, 5).join(", ")}${newIds.length > 5 ? " …" : ""}`);
  }

  const counts = {};
  for (const file of model.files) {
    const [rootName, stage] = (file.title ?? "").split("/");
    const key = `${file.platform}:${rootName}/${stage}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return { problems, newIds, storyIds: [...currentStoryIds].sort(), counts };
}

async function main() {
  const model = await collectModel();
  const result = await checkModel(model);
  if (process.argv.includes("--write-ids")) {
    const snapshot = model.snapshot ?? { schemaVersion: 1, active: [], retired: {} };
    const active = [...new Set([...(snapshot.active ?? []), ...result.newIds])].sort();
    const next = {
      schemaVersion: 1,
      note: "Web Storybook story id(URL) 목록. scripts/check-storybook.mjs가 대조한다. --write-ids는 새 id만 더하고, 지운 id는 사람이 retired에 대체 id와 함께 옮긴다.",
      active,
      retired: snapshot.retired ?? {},
    };
    await writeFile(snapshotPath, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`story ids: ${result.newIds.length}개 추가, active ${active.length}`);
    return;
  }
  if (result.problems.length > 0) {
    console.error(`storybook: ${result.problems.length}건 (정적 소스 검사, 렌더·기기 확인 아님)\n${result.problems.map((problem) => `- ${problem}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  const files = model.files.length;
  console.log(`storybook: ${files}개 파일, Web story id ${result.storyIds.length}개 규격 통과 (정적 소스 검사, 렌더·기기 확인 아님)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
