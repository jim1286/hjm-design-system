// Shared showcase data receives each host's public tokens; this directory is not a package
// and must not resolve dependencies through either host's node_modules.
//
// Web and Native token pages render the same page model (2026-10-17 token audit: the same tokens
// looked different per platform — English cards on Web, thin Korean bars on Native, raw key/value
// text for typography). Each host only maps a `TokenSpecimen` to its own primitives.

type Columns = Readonly<{compact: number; medium?: number; expanded?: number}>;

export type TokenSpecimen =
 | {kind: "none"}
 | {kind: "swatch"; color: string}
 /** Rendered through the host Text `variant`, so it is the real typography step. */
 | {kind: "textVariant"; variant: string}
 /** Rendered through the host Heading `level`. */
 | {kind: "heading"; level: string}
 | {kind: "text"; fontRole?: "ui" | "code"; fontWeight?: string; letterSpacing?: number; numeric?: string}
 /** Horizontal bar whose length is the token value. */
 | {kind: "bar"; length: number}
 /** Track filled to `fraction` of the card width, for values larger than a card. */
 | {kind: "ratio"; fraction: number}
 | {kind: "square"; size: number}
 | {kind: "height"; height: number}
 | {kind: "radius"; radius: number}
 | {kind: "stroke"; width: number}
 | {kind: "shadow"; color: string; opacity: number; radius: number; offsetY: number}
 /** `color` omitted means the theme primary. */
 | {kind: "opacity"; opacity: number; color?: string}
 | {kind: "layer"; rank: number; total: number};

export type TokenItem = Readonly<{name: string; value: string; specimen: TokenSpecimen}>;
export type TokenSection = Readonly<{title: string; description?: string; columns: Columns; items: readonly TokenItem[]}>;
export type TokenPage = Readonly<{title: string; description: string; sections: readonly TokenSection[]}>;

export const tokenSample = {
 text: "다람쥐 헌 쳇바퀴에 타고파 Aa 123",
 heading: "제목 Aa 123",
 short: "가나다 Aa",
 numeric: "1,234,567.89",
} as const;

const wide: Columns = {compact: 1, medium: 2, expanded: 3};
const small: Columns = {compact: 2, medium: 3, expanded: 4};
const swatches: Columns = {compact: 2, medium: 3, expanded: 6};

// Every public foundation belongs to a visible reference section. Keeping this shared
// prevents Web-only documentation from being mistaken for Native coverage again.
export const foundationGroups = {
 spacing: {title:"간격", description:"요소 사이의 여백과 내부 여백입니다. Web은 CSS px, 앱은 화면 밀도와 독립적인 논리 단위로 같은 숫자를 씁니다.", keys:["spacing"]},
 size: {title:"크기", description:"아이콘·아바타와 조작 요소의 크기입니다. 모든 버튼의 너비를 뜻하지 않습니다.", keys:["glyph","control"]},
 radius: {title:"둥글기", description:"모서리 반경입니다. full은 원형·캡슐 모양에 사용합니다.", keys:["radius"]},
 motion: {title:"모션", description:"전환의 지속 시간과 가속 곡선입니다. 동작 줄이기 설정에서는 프리셋의 대체 동작을 따릅니다.", keys:["motion","easing","motionPreset","spring"]},
 typography: {title:"타이포그래피", description:"글자 단계·제목 단계·굵기·서체를 실제 글자로 보여 줍니다.", keys:["typography","heading","fontWeight","fontFamily","pretendardNativeFaces","letterSpacing","numeric","largeTextThreshold"]},
 layout: {title:"화면 여백과 너비", description:"화면 가장자리 여백, 구역 간격, 행 높이, 최대 너비와 화면 너비 구간입니다.", keys:["layout","breakpoint"]},
 stroke: {title:"테두리", description:"테두리와 초점 표시에 쓰는 선 두께입니다.", keys:["stroke"]},
 effects: {title:"그림자와 투명도", description:"떠 있는 표면의 그림자와 상태·가림막 투명도입니다.", keys:["shadow","opacity","stateLayer","overlay","backdrop","scrim"]},
 layers: {title:"겹침 순서", description:"겹치는 요소의 쌓임 순서입니다. 값이 클수록 위에 놓입니다.", keys:["layer"]},
} as const;
export type FoundationGroup = keyof typeof foundationGroups;

type Tokens = Readonly<Record<string, unknown>>;
type Entry = readonly [path: string, value: unknown];
type SectionSpec = Readonly<{
 title: string; description?: string; columns: Columns;
 /** "entries" keeps each direct child object (typography step, shadow, preset) as one item. */
 itemize?: "flat" | "entries";
 format?: (value: unknown) => string;
 specimen: (path: string, value: unknown, all: readonly Entry[], tokens: Tokens) => TokenSpecimen;
}>;

const num = (value: unknown) => typeof value === "number" ? value : 0;
const record = (value: unknown) => value as Readonly<Record<string, unknown>>;
const maxOf = (all: readonly Entry[], pick: (value: unknown) => number = num) => Math.max(...all.map(([, value]) => pick(value)), 1);
// Visible copy is Korean; ReducedMotionBehavior values stay code identifiers in the contract.
const reducedMotionLabels: Readonly<Record<string, string>> = {instant: "즉시 전환", opacity: "투명도만 전환", static: "움직임 없음"};
const none = (): TokenSpecimen => ({kind: "none"});

const sectionSpecs: Readonly<Record<string, SectionSpec>> = {
 spacing: {title:"간격 단계", columns:small, specimen:(_, value) => ({kind:"bar", length:num(value)})},
 glyph: {title:"아이콘·아바타 크기", columns:small, specimen:(_, value) => ({kind:"square", size:num(value)})},
 control: {title:"조작 요소 크기", description:"높이 값은 막대 높이로, 터치 영역은 정사각형으로 보여 줍니다.", columns:wide, specimen:(path, value) =>
  /Height/.test(path) ? {kind:"height", height:num(value)} : /HitSlop/.test(path) ? {kind:"bar", length:num(value)} : {kind:"square", size:num(value)}},
 radius: {title:"모서리 반경", columns:small, specimen:(_, value) => ({kind:"radius", radius:num(value)})},
 motion: {title:"지속 시간", columns:wide, format:value => `${num(value)}ms`, specimen:(_, value, all) => ({kind:"ratio", fraction:num(value) / maxOf(all)})},
 easing: {title:"가속 곡선", columns:wide, format:value => `cubic-bezier(${(value as readonly number[]).join(", ")})`, specimen:none},
 motionPreset: {title:"전환 프리셋", description:"막대 길이는 가장 긴 지속 시간에 대한 비율입니다.", columns:wide, itemize:"entries",
  format:value => { const preset = record(value); return `${num(preset.duration)}ms · ${String(preset.easing)} · 동작 줄이기 ${reducedMotionLabels[String(preset.reducedMotion)] ?? String(preset.reducedMotion)}`; },
  specimen:(_, value, all) => ({kind:"ratio", fraction:num(record(value).duration) / maxOf(all, item => num(record(item).duration))})},
 spring: {title:"스프링", columns:wide, itemize:"entries", format:value => { const spring = record(value); return `강성 ${num(spring.stiffness)} · 감쇠 ${num(spring.damping)} · 질량 ${num(spring.mass)}`; }, specimen:none},
 fontFamily: {title:"서체 계열", columns:wide, itemize:"entries", format:value => (value as readonly string[]).join(", "), specimen:path => ({kind:"text", fontRole:path === "code" ? "code" : "ui"})},
 fontWeight: {title:"글자 굵기", columns:small, specimen:(_, value) => ({kind:"text", fontWeight:String(value)})},
 pretendardNativeFaces: {title:"앱 번들 서체 이름", description:"앱은 굵기마다 따로 등록한 Pretendard 서체를 씁니다. 키는 글자 굵기입니다.", columns:small, specimen:path => ({kind:"text", fontWeight:path})},
 letterSpacing: {title:"자간", columns:wide, specimen:(_, value) => ({kind:"text", letterSpacing:num(value)})},
 numeric: {title:"숫자 표기", columns:wide, specimen:(_, value) => ({kind:"text", numeric:String(value)})},
 typography: {title:"글자 단계", description:"글자 크기 / 줄 높이 · 굵기", columns:wide, itemize:"entries", format:formatType, specimen:path => ({kind:"textVariant", variant:path})},
 heading: {title:"제목 단계", description:"Heading의 시각 단계입니다. 문서 구조 단계와는 따로 정합니다.", columns:wide, itemize:"entries", format:formatType, specimen:path => ({kind:"heading", level:path})},
 largeTextThreshold: {title:"큰 글자 전환 배율", description:"글자 배율이 이 값 이상이면 컴포넌트가 큰 글자 배치로 바뀝니다.", columns:wide, specimen:none},
 layout: {title:"화면 여백과 행 높이", columns:wide, specimen:(path, value, all) =>
  /MaxWidth$/.test(path) ? {kind:"ratio", fraction:num(value) / maxOf(all.filter(([name]) => /MaxWidth$/.test(name)))}
  : path.startsWith("rowHeight") ? {kind:"height", height:num(value)} : {kind:"bar", length:num(value)}},
 breakpoint: {title:"화면 너비 구간", description:"막대 길이는 가장 넓은 구간에 대한 비율입니다.", columns:wide, specimen:(_, value, all) => ({kind:"ratio", fraction:num(value) / maxOf(all)})},
 stroke: {title:"선 두께", columns:small, specimen:(_, value) => ({kind:"stroke", width:num(value)})},
 shadow: {title:"그림자", columns:wide, itemize:"entries", format:value => { const shadow = record(value); return `흐림 ${num(shadow.radius)} · 아래 ${num(shadow.offsetY)} · 불투명도 ${num(shadow.opacity)}`; },
  specimen:(_, value) => { const shadow = record(value); return {kind:"shadow", color:String(shadow.color), opacity:num(shadow.opacity), radius:num(shadow.radius), offsetY:num(shadow.offsetY)}; }},
 opacity: {title:"투명도", columns:small, specimen:(_, value) => ({kind:"opacity", opacity:num(value)})},
 stateLayer: {title:"상태 레이어", description:"누름·초점 같은 상태에서 표면 위에 겹치는 색의 불투명도입니다.", columns:small, specimen:(_, value) => ({kind:"opacity", opacity:num(value)})},
 overlay: {title:"가림막 불투명도", columns:small, specimen:(_, value, __, tokens) => ({kind:"opacity", opacity:num(value), color:String(record(record(tokens.backdrop).modal).color)})},
 backdrop: {title:"가림막", columns:small, itemize:"entries", format:value => { const backdrop = record(value); return `${String(backdrop.color)} · 불투명도 ${num(backdrop.opacity)}`; },
  specimen:(_, value) => ({kind:"opacity", opacity:num(record(value).opacity), color:String(record(value).color)})},
 scrim: {title:"가림막 색", columns:small, specimen:(_, value) => ({kind:"swatch", color:String(value)})},
 layer: {title:"겹침 단계", columns:small, specimen:(path, _, all) => ({kind:"layer", rank:all.findIndex(([name]) => name === path), total:all.length})},
};

function formatType(value: unknown) {
 const step = record(value);
 return `${num(step.fontSize)} / ${num(step.lineHeight)} · 굵기 ${String(step.fontWeight)}`;
}

function entriesOf(value: unknown, itemize: "flat" | "entries"): Entry[] {
 if (value === null || typeof value !== "object" || Array.isArray(value)) return [["", value]];
 if (itemize === "entries") return Object.entries(value);
 return Object.entries(value).flatMap(([key, item]) => entriesOf(item, "flat").map(([path, leaf]) => [path ? `${key}.${path}` : key, leaf] as const));
}

function formatValue(value: unknown) {
 return Array.isArray(value) ? value.join(" · ") : String(value);
}

export function foundationPage(tokens: Tokens, group: FoundationGroup): TokenPage {
 const {title, description, keys} = foundationGroups[group];
 return {title, description, sections: keys.map(key => {
  const spec = sectionSpecs[key];
  if (!spec) throw new Error(`No token section for ${key}`);
  const all = entriesOf(tokens[key], spec.itemize ?? "flat");
  return {title: spec.title, ...(spec.description ? {description: spec.description} : {}), columns: spec.columns, items: all.map(([path, value]) => ({
   name: path ? `${key}.${path}` : key,
   value: (spec.format ?? formatValue)(value),
   specimen: spec.specimen(path, value, all, tokens),
  }))};
 })};
}

type ColorTokens = Readonly<{
 THEMES: Readonly<Record<"light" | "dark", Readonly<Record<string, string>>>>;
 ACCENTS: Readonly<Record<"light" | "dark", Readonly<Record<string, string>>>>;
 accentFill: Readonly<Record<string, string>> & Readonly<{info: string}>;
 onAccentFill: string;
 accentTint: Readonly<Record<string, number>>;
 brandGradient: Readonly<{from: string; to: string}>;
 onBrandGradient: string;
}>;

const themeLabels = {light: "밝은 테마", dark: "어두운 테마"} as const;

export function colorPage({THEMES, ACCENTS, accentFill, onAccentFill, accentTint, brandGradient, onBrandGradient}: ColorTokens): TokenPage {
 const swatch = (name: string, color: string): TokenItem => ({name, value: color, specimen: {kind: "swatch", color}});
 return {
  title: "색상",
  description: "제품은 팔레트 이름 대신 의미 이름으로 색을 고릅니다. 밝은 테마와 어두운 테마는 같은 키를 제공합니다.",
  sections: [
   ...(["light", "dark"] as const).map(theme => ({title: themeLabels[theme], columns: swatches, items: Object.entries(THEMES[theme]).map(([name, color]) => swatch(name, color))})),
   ...(["light", "dark"] as const).map(theme => ({title: `상태 강조색 · ${themeLabels[theme]}`, columns: swatches, items: Object.entries(ACCENTS[theme]).map(([name, color]) => swatch(`accent.${name}`, color))})),
   {title: "강조 채움색", description: "채움색 위 글자는 onAccentFill을 함께 씁니다.", columns: swatches, items: [...Object.entries(accentFill).map(([name, color]) => swatch(`accentFill.${name}`, color)), swatch("onAccentFill", onAccentFill)]},
   {title: "강조 옅은 배경 불투명도", columns: small, items: Object.entries(accentTint).map(([name, opacity]) => ({name: `accentTint.${name}`, value: String(opacity), specimen: {kind: "opacity", opacity, color: accentFill.info}}))},
   {title: "조직 그라데이션", description: "HJM 조직 화면의 기본 서명입니다. 제품 기본 브랜드 색이 아닙니다.", columns: swatches, items: [swatch("brandGradient.from", brandGradient.from), swatch("brandGradient.to", brandGradient.to), swatch("onBrandGradient", onBrandGradient)]},
  ],
 };
}
