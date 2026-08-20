import { useState, type CSSProperties, type ReactNode } from "react";
import {
  behaviorRegistry,
  componentCatalog,
  recipeRegistry,
  resolveColorReference,
  resolveDesignSystemProviderValue,
  type BehaviorName,
  type ColorReference,
  type ComponentCatalogEntry,
  type ComponentName,
  type ComponentPlatform,
  type DesignSystemProviderValue,
  type RecipeName,
} from "@hjm/design-system";
import {
  showcaseManifest,
  showcaseScenarios,
  type ShowcaseComponentEntry,
} from "@hjm/design-system/showcase";

import { useWebDesignSystemEnvironment } from "../runtime/WebDesignSystemProvider";

export type ContractStoryProps = { name: ComponentName };

type CatalogEntry = (typeof componentCatalog)[number];
type MatureCatalogEntry = Extract<CatalogEntry, { readonly status: "stable" | "beta" }>;
type WebRendererLiteralEntry = Exclude<MatureCatalogEntry, { readonly platform: "native" }>;
export type WebRendererComponentName = WebRendererLiteralEntry["name"];
type WebRendererCatalogEntry = ComponentCatalogEntry & Readonly<{
  name: WebRendererComponentName;
  platform: Exclude<ComponentPlatform, "native">;
  status: "stable" | "beta";
}>;

type RecipeBinding = {
  [Name in RecipeName]: Readonly<{ name: Name; value: (typeof recipeRegistry)[Name] }>;
}[RecipeName];
type BehaviorBinding = {
  [Name in BehaviorName]: Readonly<{ name: Name; value: (typeof behaviorRegistry)[Name] }>;
}[BehaviorName];

export type WebRendererDefinition = Readonly<{
  component: WebRendererCatalogEntry;
  recipe: RecipeBinding;
  behavior: BehaviorBinding | null;
  adapterKind: "recipe-presentation" | "recipe-behavior-presentation";
  evidenceSource: Readonly<{
    owner: "@hjm/design-system";
    recipe: RecipeBinding;
    behavior: BehaviorBinding | null;
  }>;
  resolvePresentation(providerValue: DesignSystemProviderValue): RendererPresentation;
  render(): ReactNode;
}>;

type RendererStyle = CSSProperties &
  Record<`--hjm-evidence-${string}`, string | number>;

type RendererMetricProperty =
  | "borderWidth"
  | "borderRadius"
  | "gap"
  | "minHeight"
  | "minWidth"
  | "maxWidth"
  | "paddingBlock"
  | "paddingInline"
  | "paddingInlineEnd"
  | "paddingInlineStart";

export type RendererPresentation = Readonly<{
  style: RendererStyle;
  attributes: Readonly<{
    "data-hjm-adapter-kind": WebRendererDefinition["adapterKind"];
    "data-hjm-consumed-paths": string;
    "data-hjm-evidence-source": RecipeName;
    "data-hjm-presentation-signature": string;
  }>;
  consumption: Readonly<{
    recipePaths: readonly string[];
    resolvedColor: string | null;
    resolvedMetric: number | null;
    resolvedMetricProperty: RendererMetricProperty | null;
  }>;
}>;

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));

function FieldPreview({ multiline = false, search = false }: { multiline?: boolean; search?: boolean }) {
  return (
    <label className="hjm-field">
      <span>이름</span>
      {multiline ? <textarea defaultValue="여러 줄 입력 예시" /> : <input type={search ? "search" : "text"} defaultValue={search ? "선수 검색" : "홍길동"} />}
      <small>필수 정보는 입력 아래에서 설명합니다.</small>
    </label>
  );
}

function ChoicePreview({ radio = false, group = false }: { radio?: boolean; group?: boolean }) {
  const type = radio ? "radio" : "checkbox";
  const content = (
    <>
      <label className="hjm-choice"><input type={type} name="choice" defaultChecked /> 첫 번째 선택</label>
      <label className="hjm-choice"><input type={type} name="choice" /> 두 번째 선택</label>
      <label className="hjm-choice"><input type={type} name="choice" disabled /> 사용할 수 없음</label>
    </>
  );
  return group ? <fieldset className="hjm-choice-group"><legend>선택 그룹</legend>{content}</fieldset> : <div className="hjm-preview-row">{content}</div>;
}

function OverlayPreview({ kind }: { kind: "Dialog" | "AlertDialog" | "Sheet" | "Tooltip" }) {
  const [open, setOpen] = useState(false);
  if (kind === "Tooltip") {
    return <button className="hjm-demo-button" title="자세한 도움말">도움말에 포커스하거나 가리키기</button>;
  }
  return (
    <>
      <button className="hjm-demo-button" onClick={() => setOpen(true)}>{kind} 열기</button>
      {open && (
        <div className="hjm-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && kind === "Dialog" && setOpen(false)}>
          <section className={`hjm-modal ${kind === "Sheet" ? "hjm-sheet" : ""}`} role={kind === "AlertDialog" ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={`${kind}-title`}>
            <h3 id={`${kind}-title`}>{kind} 제목</h3>
            <p>긴 설명도 잘리지 않고 행동의 결과를 명확하게 전달합니다.</p>
            <div className="hjm-actions"><button onClick={() => setOpen(false)}>취소</button><button className="hjm-demo-button" onClick={() => setOpen(false)}>확인</button></div>
          </section>
        </div>
      )}
    </>
  );
}

function assertNever(value: never): never {
  throw new Error(`Missing Web Showcase renderer: ${String(value)}`);
}

/** Only mature, Web-supported contracts can reach this renderer. */
function WebPreviewRenderer({ name }: { name: WebRendererComponentName }) {
  const [selected, setSelected] = useState("첫 번째");
  switch (name) {
    case "Text": return <div className="hjm-type-sample"><h2>제목 텍스트</h2><p>본문 텍스트는 의미와 위계를 보존합니다.</p><small>보조 정보</small></div>;
    case "Icon": return <div className="hjm-icon-grid" aria-label="Semantic icons"><span aria-hidden>⌂</span><span aria-hidden>✓</span><span aria-hidden>!</span><span aria-hidden>→</span></div>;
    case "Surface": case "Card": return <article className="hjm-demo-surface"><strong>{name} 제목</strong><p>제품이 색·간격·모서리를 임의로 덮지 않는 의미 기반 컨테이너입니다.</p></article>;
    case "Divider": return <div className="hjm-demo-surface">위 내용<hr />아래 내용</div>;
    case "Section": return <section className="hjm-demo-surface"><h3>섹션 제목</h3><p>관련 콘텐츠를 하나의 의미 단위로 묶습니다.</p></section>;
    case "Stack": return <div className="hjm-demo-stack"><button>첫 번째</button><button>두 번째</button><button>세 번째</button></div>;
    case "Layout": return <div className="hjm-demo-layout"><header>Header</header><aside>Navigation</aside><main>Main landmark</main></div>;
    case "Button": return <div className="hjm-preview-row"><button className="hjm-demo-button">Primary</button><button>Secondary</button><button disabled>Disabled</button></div>;
    case "IconButton": return <div className="hjm-preview-row"><button className="hjm-icon-button" aria-label="좋아요">♡</button><button className="hjm-icon-button" aria-label="닫기">×</button></div>;
    case "Link": return <p><a href="#link-target">실제 목적지 링크</a> · <a href="https://example.com">외부 링크</a></p>;
    case "Field": return <FieldPreview />;
    case "SearchField": return <FieldPreview search />;
    case "TextArea": return <FieldPreview multiline />;
    case "Checkbox": return <ChoicePreview />;
    case "Radio": return <ChoicePreview radio />;
    case "CheckboxGroup": return <ChoicePreview group />;
    case "RadioGroup": return <ChoicePreview radio group />;
    case "Switch": return <label className="hjm-switch"><input type="checkbox" defaultChecked /><span>알림 받기</span></label>;
    case "Chip": return <div className="hjm-preview-row"><button className="hjm-chip" aria-pressed="true">선택됨</button><button className="hjm-chip">기본</button></div>;
    case "SegmentedControl": return <div className="hjm-segments" role="radiogroup" aria-label="보기 방식">{["목록", "격자"].map((item) => <button key={item} role="radio" aria-checked={selected === item} onClick={() => setSelected(item)}>{item}</button>)}</div>;
    case "Select": return <label className="hjm-field"><span>언어</span><select defaultValue="ko"><option value="ko">한국어</option><option value="en">English</option></select></label>;
    case "Combobox": return <label className="hjm-field"><span>선수 찾기</span><input list="players" placeholder="이름 입력" /><datalist id="players"><option value="김도영" /><option value="양현종" /></datalist></label>;
    case "Tabs": return <div><div className="hjm-tabs" role="tablist">{["첫 번째", "두 번째"].map((item) => <button key={item} role="tab" aria-selected={selected === item} onClick={() => setSelected(item)}>{item}</button>)}</div><div className="hjm-demo-surface" role="tabpanel">{selected} 패널 내용</div></div>;
    case "BottomNavigation": return <nav className="hjm-bottom-nav" aria-label="주요 메뉴">{["홈", "기록", "설정"].map((item, index) => <a key={item} href={`#nav-${index}`} aria-current={index === 0 ? "page" : undefined}><span aria-hidden>{index === 0 ? "⌂" : index === 1 ? "▤" : "⚙"}</span>{item}</a>)}</nav>;
    case "LoadMore": return <button className="hjm-wide-button">더 보기</button>;
    case "Menu": return <div className="hjm-menu" role="menu"><button role="menuitem">이름 바꾸기</button><button role="menuitem">공유하기</button><button role="menuitem" className="hjm-danger">삭제</button></div>;
    case "Avatar": return <div className="hjm-avatar-row"><span className="hjm-avatar" role="img" aria-label="홍길동">홍</span><span className="hjm-avatar hjm-avatar-lg" role="img" aria-label="김민수">김</span></div>;
    case "Badge": return <div className="hjm-preview-row"><span className="hjm-demo-badge">진행 중</span><span className="hjm-demo-badge hjm-success">완료</span></div>;
    case "CounterBadge": return <button className="hjm-icon-button" aria-label="알림 12개">♢<span className="hjm-counter" aria-hidden>12</span></button>;
    case "List": return <ul className="hjm-list"><li>첫 번째 항목</li><li>두 번째 항목</li><li>세 번째 항목</li></ul>;
    case "ListRow": return <button className="hjm-list-row"><span className="hjm-avatar">홍</span><span><strong>홍길동</strong><small>선수 상세 보기</small></span><span aria-hidden>›</span></button>;
    case "Accordion": return <div className="hjm-accordion"><details open><summary>자주 묻는 질문</summary><p>공개 상태와 키보드 조작을 함께 확인합니다.</p></details><details><summary>다른 질문</summary><p>두 번째 답변입니다.</p></details></div>;
    case "Statistic": return <dl className="hjm-stat-grid"><div><dt>타율</dt><dd>.328</dd><small>↑ 리그 2위</small></div><div><dt>홈런</dt><dd>24</dd><small>시즌 누적</small></div></dl>;
    case "Timeline": return <ol className="hjm-timeline"><li><time>10:32</time><strong>경기 시작</strong></li><li><time>11:04</time><strong>득점</strong><small>2루타로 주자 홈인</small></li><li><time>11:21</time><strong>투수 교체</strong></li></ol>;
    case "DescriptionList": return <dl className="hjm-description-list"><div><dt>소속</dt><dd>서울 HJM</dd></div><div><dt>포지션</dt><dd>내야수</dd></div><div><dt>등번호</dt><dd>7</dd></div><div><dt>데뷔</dt><dd>2021</dd></div></dl>;
    case "Image": return <figure className="hjm-image"><div role="img" aria-label="야구장 풍경">HJM</div><figcaption>콘텐츠 이미지와 대체 설명</figcaption></figure>;
    case "Tag": return <div className="hjm-preview-row"><span className="hjm-demo-badge">내야수</span><span className="hjm-demo-badge hjm-success">등록 선수</span><span className="hjm-demo-badge">2026 시즌</span></div>;
    case "EmptyState": return <div className="hjm-empty"><span aria-hidden>◇</span><h3>아직 항목이 없어요</h3><p>새 항목을 추가하면 여기에 표시됩니다.</p><button className="hjm-demo-button">추가하기</button></div>;
    case "Notice": return <div className="hjm-notice" role="status"><strong>확인해 주세요</strong><p>저장하지 않은 변경 사항이 있습니다.</p></div>;
    case "Progress": return <div><label htmlFor="progress">업로드 68%</label><progress id="progress" value="68" max="100" /></div>;
    case "Spinner": return <div className="hjm-spinner" role="status" aria-label="불러오는 중" />;
    case "Skeleton": return <div className="hjm-skeletons" aria-label="콘텐츠 불러오는 중"><span /><span /><span /></div>;
    case "Result": return <div className="hjm-empty"><span aria-hidden>✓</span><h3>설정이 완료됐어요</h3><p>이제 새 환경으로 계속할 수 있습니다.</p><button className="hjm-demo-button">대시보드로</button></div>;
    case "Toast": return <div className="hjm-toast" role="status"><span aria-hidden>✓</span><span><strong>저장했어요</strong><small>변경 사항이 반영되었습니다.</small></span><button aria-label="닫기">×</button></div>;
    case "Dialog": case "AlertDialog": case "Sheet": case "Tooltip": return <OverlayPreview kind={name} />;
    default: return assertNever(name);
  }
}

type RecipeLeaf = Readonly<{ path: string; value: unknown }>;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function isColorReference(value: unknown): value is ColorReference {
  if (!isRecord(value) || typeof value.key !== "string") return false;
  return value.source === "theme" || value.source === "accent" || value.source === "accentFill";
}

function collectRecipeLeaves(value: unknown, path = "recipe", leaves: RecipeLeaf[] = []): RecipeLeaf[] {
  if (isColorReference(value)) {
    leaves.push({ path, value });
    return leaves;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRecipeLeaves(item, `${path}.${index}`, leaves));
    return leaves;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      collectRecipeLeaves(item, `${path}.${key}`, leaves);
    }
    return leaves;
  }
  leaves.push({ path, value });
  return leaves;
}

function resolveRecipeLeafColor(
  leaf: RecipeLeaf,
  providerValue: DesignSystemProviderValue,
): string | null {
  if (isColorReference(leaf.value)) {
    return resolveColorReference(leaf.value, providerValue.palette);
  }
  if (
    typeof leaf.value === "string" &&
    Object.hasOwn(providerValue.palette.theme, leaf.value)
  ) {
    return providerValue.palette.theme[
      leaf.value as keyof typeof providerValue.palette.theme
    ];
  }
  return null;
}

function presentationSignature(source: string): string {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function resolveMetricProperty(path: string): RendererMetricProperty {
  if (/insetStart$/i.test(path)) return "paddingInlineStart";
  if (/insetEnd$/i.test(path)) return "paddingInlineEnd";
  if (/paddingHorizontal$/i.test(path)) return "paddingInline";
  if (/paddingVertical$/i.test(path)) return "paddingBlock";
  if (/(?:gap|gaps\.[^.]+)$/i.test(path)) return "gap";
  if (/(?:radius|radii\.[^.]+)$/i.test(path)) return "borderRadius";
  if (/thickness$/i.test(path)) return "borderWidth";
  if (/maxWidth$/i.test(path)) return "maxWidth";
  if (/minWidth$/i.test(path)) return "minWidth";
  if (/width$/i.test(path)) return "minWidth";
  return "minHeight";
}

function resolveRecipePresentation(
  recipe: RecipeBinding,
  adapterKind: WebRendererDefinition["adapterKind"],
  providerValue: DesignSystemProviderValue,
): RendererPresentation {
  const leaves = collectRecipeLeaves(recipe.value);
  if (leaves.length === 0) {
    throw new Error(`Recipe evidence has no consumable values: ${recipe.name}`);
  }

  const defaultSelections = new Set(
    leaves.flatMap(({ path, value }) =>
      path.startsWith("recipe.defaults.") && typeof value === "string" ? [value] : [],
    ),
  );
  const colors = leaves.flatMap((leaf) => {
    const value = resolveRecipeLeafColor(leaf, providerValue);
    return value ? [{ leaf, value }] : [];
  });
  const defaultColors = colors.filter(({ leaf }) =>
    leaf.path.split(".").some((segment) => defaultSelections.has(segment)),
  );
  const activeColors = defaultColors.length > 0 ? defaultColors : colors;
  const foregroundColor = activeColors.find(
    ({ leaf }) =>
      /(?:content|foreground|text|color|tones?\.)/i.test(leaf.path) &&
      !/(?:background|border|shadow)/i.test(leaf.path),
  );
  const resolvedColor = foregroundColor ?? activeColors[0] ?? null;
  const metricCandidates = leaves.filter(
    (leaf) =>
      typeof leaf.value === "number" &&
      leaf.value >= 1 &&
      leaf.value <= (/(?:min|max)?width/i.test(leaf.path) ? 1280 : 160) &&
      /(?:minHeight|height|diameter|paddingHorizontal|paddingVertical|gap|size|thickness|width|insetStart|insetEnd|(?:gaps|sizes|radii)\.[^.]+)$/i.test(leaf.path),
  );
  const metric = metricCandidates.find(({ path }) =>
    path.split(".").some((segment) => defaultSelections.has(segment)),
  ) ?? metricCandidates[0] ?? null;
  const metricProperty = metric ? resolveMetricProperty(metric.path) : null;
  const recipePaths = [resolvedColor?.leaf.path, metric?.path, ...leaves.map(({ path }) => path)]
    .filter((path): path is string => path !== undefined)
    .filter((path, index, paths) => paths.indexOf(path) === index)
    .slice(0, 5);
  const serializedLeaves = leaves
    .map(({ path, value }) => `${path}:${JSON.stringify(value)}`)
    .join("|");
  const signature = presentationSignature(
    `${recipe.name}|${providerValue.environment.theme}|${providerValue.environment.direction}|${providerValue.environment.textScale}|${providerValue.environment.reducedMotion}|${serializedLeaves}`,
  );
  const style: RendererStyle = {
    "--hjm-evidence-leaf-count": leaves.length,
    "--hjm-evidence-signature": signature,
    direction: providerValue.environment.direction,
  };
  if (resolvedColor) {
    style["--hjm-evidence-color"] = resolvedColor.value;
    if (foregroundColor) style.color = foregroundColor.value;
    else if (!metric) style.backgroundColor = resolvedColor.value;
  }
  if (metric && typeof metric.value === "number") {
    style["--hjm-evidence-metric"] = `${metric.value}px`;
    const appliedMetric = metricProperty === "minHeight"
      ? Math.min(metric.value, 96)
      : metric.value;
    if (metricProperty === "paddingInlineStart") style.paddingInlineStart = appliedMetric;
    else if (metricProperty === "paddingInlineEnd") style.paddingInlineEnd = appliedMetric;
    else if (metricProperty === "paddingInline") style.paddingInline = appliedMetric;
    else if (metricProperty === "paddingBlock") style.paddingBlock = appliedMetric;
    else if (metricProperty === "gap") style.gap = appliedMetric;
    else if (metricProperty === "borderWidth") style.borderWidth = appliedMetric;
    else if (metricProperty === "borderRadius") style.borderRadius = appliedMetric;
    else if (metricProperty === "maxWidth") style.maxWidth = appliedMetric;
    else if (metricProperty === "minWidth") style.minWidth = appliedMetric;
    else style.minHeight = appliedMetric;
  }

  return {
    style,
    attributes: {
      "data-hjm-adapter-kind": adapterKind,
      "data-hjm-consumed-paths": recipePaths.join(","),
      "data-hjm-evidence-source": recipe.name,
      "data-hjm-presentation-signature": signature,
    },
    consumption: {
      recipePaths,
      resolvedColor: resolvedColor?.value ?? null,
      resolvedMetric: typeof metric?.value === "number" ? metric.value : null,
      resolvedMetricProperty: metricProperty,
    },
  };
}

function createWebRendererDefinition(
  name: WebRendererComponentName,
  recipeName: RecipeName,
  behaviorName: BehaviorName | null = null,
): WebRendererDefinition {
  const component = componentCatalog.find((entry) => entry.name === name);
  if (!component || component.status === "planned" || component.platform === "native") {
    throw new Error(`Invalid Web renderer registration: ${name}`);
  }
  const webComponent = component as WebRendererCatalogEntry;
  if (webComponent.recipe !== recipeName) {
    throw new Error(`Renderer ${name} must bind catalog recipe ${String(webComponent.recipe)}`);
  }
  if ((webComponent.behavior ?? null) !== behaviorName) {
    throw new Error(`Renderer ${name} must bind catalog behavior ${String(webComponent.behavior)}`);
  }
  const recipe = { name: recipeName, value: recipeRegistry[recipeName] } as RecipeBinding;
  const behavior = behaviorName
    ? { name: behaviorName, value: behaviorRegistry[behaviorName] } as BehaviorBinding
    : null;
  const adapterKind = behavior
    ? "recipe-behavior-presentation"
    : "recipe-presentation";
  return {
    component: webComponent,
    recipe,
    behavior,
    adapterKind,
    evidenceSource: {
      owner: "@hjm/design-system",
      recipe,
      behavior,
    },
    resolvePresentation: (providerValue) =>
      resolveRecipePresentation(recipe, adapterKind, providerValue),
    render: () => <WebPreviewRenderer name={name} />,
  };
}

/** Explicit renderer evidence: catalog maturity alone cannot create a preview. */
export const webRendererRegistry = {
  Text: createWebRendererDefinition("Text", "textRecipe"),
  Icon: createWebRendererDefinition("Icon", "iconRecipe"),
  Surface: createWebRendererDefinition("Surface", "surfaceRecipe"),
  Divider: createWebRendererDefinition("Divider", "dividerRecipe"),
  Section: createWebRendererDefinition("Section", "sectionRecipe"),
  Stack: createWebRendererDefinition("Stack", "stackRecipe"),
  Layout: createWebRendererDefinition("Layout", "layoutRecipe", "layout"),
  Button: createWebRendererDefinition("Button", "buttonRecipe"),
  IconButton: createWebRendererDefinition("IconButton", "iconButtonRecipe"),
  Link: createWebRendererDefinition("Link", "linkRecipe", "link"),
  Field: createWebRendererDefinition("Field", "fieldRecipe", "field"),
  SearchField: createWebRendererDefinition("SearchField", "searchFieldRecipe", "searchField"),
  TextArea: createWebRendererDefinition("TextArea", "fieldRecipe"),
  Checkbox: createWebRendererDefinition("Checkbox", "selectionControlRecipe", "checkbox"),
  Radio: createWebRendererDefinition("Radio", "selectionControlRecipe"),
  CheckboxGroup: createWebRendererDefinition("CheckboxGroup", "selectionGroupRecipe", "checkboxGroup"),
  RadioGroup: createWebRendererDefinition("RadioGroup", "selectionGroupRecipe", "radioGroup"),
  Switch: createWebRendererDefinition("Switch", "switchRecipe", "switch"),
  Chip: createWebRendererDefinition("Chip", "chipRecipe", "chip"),
  SegmentedControl: createWebRendererDefinition("SegmentedControl", "segmentedControlRecipe", "segmentedControl"),
  Select: createWebRendererDefinition("Select", "selectRecipe", "select"),
  Combobox: createWebRendererDefinition("Combobox", "comboboxRecipe", "combobox"),
  Tabs: createWebRendererDefinition("Tabs", "tabsRecipe", "tabs"),
  BottomNavigation: createWebRendererDefinition("BottomNavigation", "bottomNavigationRecipe", "bottomNavigation"),
  LoadMore: createWebRendererDefinition("LoadMore", "loadMoreRecipe", "loadMore"),
  Menu: createWebRendererDefinition("Menu", "menuRecipe", "menu"),
  Avatar: createWebRendererDefinition("Avatar", "avatarRecipe"),
  Badge: createWebRendererDefinition("Badge", "badgeRecipe"),
  CounterBadge: createWebRendererDefinition("CounterBadge", "counterBadgeRecipe"),
  Card: createWebRendererDefinition("Card", "surfaceRecipe"),
  List: createWebRendererDefinition("List", "listRecipe"),
  ListRow: createWebRendererDefinition("ListRow", "listRowRecipe"),
  Accordion: createWebRendererDefinition("Accordion", "accordionRecipe", "disclosureGroup"),
  Statistic: createWebRendererDefinition("Statistic", "statisticRecipe"),
  Timeline: createWebRendererDefinition("Timeline", "timelineRecipe"),
  DescriptionList: createWebRendererDefinition("DescriptionList", "descriptionListRecipe"),
  Image: createWebRendererDefinition("Image", "imageRecipe"),
  Tag: createWebRendererDefinition("Tag", "tagRecipe"),
  EmptyState: createWebRendererDefinition("EmptyState", "emptyStateRecipe"),
  Notice: createWebRendererDefinition("Notice", "noticeRecipe"),
  Progress: createWebRendererDefinition("Progress", "progressRecipe"),
  Spinner: createWebRendererDefinition("Spinner", "spinnerRecipe"),
  Skeleton: createWebRendererDefinition("Skeleton", "skeletonRecipe"),
  Result: createWebRendererDefinition("Result", "resultRecipe"),
  Toast: createWebRendererDefinition("Toast", "toastRecipe", "toast"),
  Dialog: createWebRendererDefinition("Dialog", "dialogRecipe", "dialog"),
  AlertDialog: createWebRendererDefinition("AlertDialog", "alertDialogRecipe", "alertDialog"),
  Sheet: createWebRendererDefinition("Sheet", "sheetRecipe", "sheet"),
  Tooltip: createWebRendererDefinition("Tooltip", "tooltipRecipe", "tooltip"),
} satisfies Readonly<Record<WebRendererComponentName, WebRendererDefinition>>;

export const webRendererComponentNames = Object.keys(
  webRendererRegistry,
) as readonly WebRendererComponentName[];

export type WebShowcaseCoverageSummary = Readonly<{
  canonical: number;
  webReferences: number;
  contractOnly: number;
  nativeOnly: number;
}>;

/** Counts the three mutually exclusive Storybook evidence modes from their canonical sources. */
export function summarizeWebShowcaseCoverage(): WebShowcaseCoverageSummary {
  const canonicalCatalog: readonly ComponentCatalogEntry[] = componentCatalog;
  return {
    canonical: canonicalCatalog.length,
    webReferences: webRendererComponentNames.length,
    contractOnly: canonicalCatalog.filter(
      ({ status }) => status === "planned" || status === "deprecated",
    ).length,
    nativeOnly: canonicalCatalog.filter(
      ({ platform, status }) =>
        platform === "native" && (status === "stable" || status === "beta"),
    ).length,
  };
}

export function isWebRendererComponent(name: ComponentName): name is WebRendererComponentName {
  return Object.hasOwn(webRendererRegistry, name);
}

export function ComponentPreview({ name }: { name: WebRendererComponentName }) {
  const definition = webRendererRegistry[name];
  const environment = useWebDesignSystemEnvironment();
  const providerValue = resolveDesignSystemProviderValue(environment, {
    systemTheme: environment.theme,
  });
  const presentation = definition.resolvePresentation(providerValue);
  return (
    <div
      {...presentation.attributes}
      data-hjm-behavior={definition.behavior?.name ?? "none"}
      data-hjm-recipe={definition.recipe.name}
      data-hjm-renderer={name}
      style={presentation.style}
    >
      {definition.render()}
    </div>
  );
}

function StoryHeader({ entry }: { entry: ShowcaseComponentEntry }) {
  const { component } = entry;
  return (
    <>
      <p className="hjm-eyebrow">{component.category} · {component.platform}</p>
      <h1 className="hjm-title">{component.name}</h1>
      <div className="hjm-meta-row"><span className="hjm-pill" data-status={component.status}>{component.status}</span>{component.behavior && <span className="hjm-pill">behavior: {component.behavior}</span>}{component.recipe && <span className="hjm-pill">recipe: {component.recipe}</span>}</div>
      {component.roadmap && <section className="hjm-roadmap-callout" data-roadmap={component.roadmap.state}><span>{component.roadmap.state}</span><p>{component.roadmap.summary}</p>{component.roadmap.targets && <small>Composed with: {component.roadmap.targets.join(" + ")}</small>}</section>}
    </>
  );
}

function EvidenceSection({ entry, contract }: { entry: ShowcaseComponentEntry; contract: string }) {
  return (
    <section className="hjm-section" aria-labelledby={`${entry.component.name}-evidence`}>
      <h2 className="hjm-section-title" id={`${entry.component.name}-evidence`}>Required evidence</h2>
      <div className="hjm-grid"><article className="hjm-card"><h3>Surfaces</h3><p>{entry.requiredSurfaces.join(" · ")}</p></article><article className="hjm-card"><h3>Scenarios</h3><ul className="hjm-check-list">{entry.requiredScenarios.map((id) => <li key={id}>{scenarioLabels.get(id)}</li>)}</ul></article><article className="hjm-card"><h3>Contract</h3><p>{contract}</p></article></div>
    </section>
  );
}

export function ContractOnlyStory({ entry }: { entry: ShowcaseComponentEntry }) {
  const recipe = entry.component.recipe ? recipeRegistry[entry.component.recipe] : null;
  const contract = recipe ? `Recipe branches: ${Object.keys(recipe).join(" · ")}` : "Behavior/API or scope decision only";
  return (
    <main className="hjm-page" data-showcase-mode="contract-only">
      <StoryHeader entry={entry} />
      <section className="hjm-section" aria-labelledby={`${entry.component.name}-contract`}><h2 className="hjm-section-title" id={`${entry.component.name}-contract`}>Contract only</h2><div className="hjm-stage"><div className="hjm-roadmap-preview"><span className="hjm-pill">No renderer evidence</span><strong>{entry.component.name}</strong><p>이 페이지는 범위와 승격 조건만 기록합니다. 구현된 Web UI를 의미하지 않습니다.</p></div></div></section>
      <EvidenceSection entry={entry} contract={contract} />
    </main>
  );
}

export function UnsupportedWebStory({ entry }: { entry: ShowcaseComponentEntry }) {
  return (
    <main className="hjm-page" data-showcase-mode="web-unsupported">
      <StoryHeader entry={entry} />
      <section className="hjm-section" aria-labelledby={`${entry.component.name}-unsupported`}><h2 className="hjm-section-title" id={`${entry.component.name}-unsupported`}>Web renderer unsupported</h2><div className="hjm-stage"><div className="hjm-roadmap-preview"><span className="hjm-pill">Native surface</span><strong>{entry.component.name}</strong><p>이 계약은 Native renderer에서 검증합니다. Showcase가 유사한 Web UI를 만들어 지원 범위를 과장하지 않습니다.</p></div></div></section>
      <EvidenceSection entry={entry} contract="Native renderer contract; no Web implementation is registered" />
    </main>
  );
}

function InteractiveWebStory({ entry, name }: { entry: ShowcaseComponentEntry; name: WebRendererComponentName }) {
  const definition = webRendererRegistry[name];
  const contract = definition.recipe
    ? `Recipe: ${definition.recipe.name}; branches: ${Object.keys(definition.recipe.value).join(" · ")}`
    : "Provider/API contract with a registered Web adapter";
  return (
    <main className="hjm-page" data-showcase-mode="web-renderer">
      <StoryHeader entry={entry} />
      <section className="hjm-section" aria-labelledby={`${name}-preview`}><h2 className="hjm-section-title" id={`${name}-preview`}>Interactive Web reference</h2><div className="hjm-stage"><ComponentPreview name={name} /></div></section>
      <EvidenceSection entry={entry} contract={contract} />
    </main>
  );
}

export function ContractStory({ name }: ContractStoryProps) {
  const entry = showcaseManifest.find(({ component }) => component.name === name);
  if (!entry) throw new Error(`Unknown showcase component: ${name}`);
  if (entry.component.status === "planned" || entry.component.status === "deprecated") {
    return <ContractOnlyStory entry={entry} />;
  }
  if (entry.component.platform === "native") {
    return <UnsupportedWebStory entry={entry} />;
  }
  if (!isWebRendererComponent(name)) {
    throw new Error(`Mature Web component is missing a renderer registration: ${name}`);
  }
  return <InteractiveWebStory entry={entry} name={name} />;
}
