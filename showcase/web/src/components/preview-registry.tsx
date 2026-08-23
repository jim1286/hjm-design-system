import { type CSSProperties, type ReactNode } from "react";
import {
  Button as HjmButton,
  IconButton as HjmIconButton,
} from "@hjm/react/actions";
import {
  Badge as HjmBadge,
  Card as HjmCard,
  CounterBadge as HjmCounterBadge,
  DescriptionList as HjmDescriptionList,
  Icon as HjmIcon,
  Image as HjmImage,
  ListRow as HjmListRow,
  Tag as HjmTag,
  Timeline as HjmTimeline,
} from "@hjm/react/display";
import {
  EmptyState as HjmEmptyState,
  Result as HjmResult,
} from "@hjm/react/feedback";
import {
  Field as HjmField,
  SearchField as HjmSearchField,
  Select as HjmSelect,
  TextArea as HjmTextArea,
} from "@hjm/react/forms";
import { OtpField as HjmOtpField } from "@hjm/react/otp-field";
import { PasswordField as HjmPasswordField } from "@hjm/react/password-field";
import {
  Grid as HjmGrid,
  Layout as HjmLayout,
  Stack as HjmStack,
  Surface as HjmSurface,
  Text as HjmText,
} from "@hjm/react/layout";
import {
  BottomNavigation as HjmBottomNavigation,
  LoadMore as HjmLoadMore,
  Tabs as HjmTabs,
} from "@hjm/react/navigation";
import {
  Checkbox as HjmCheckbox,
  CheckboxGroup as HjmCheckboxGroup,
  Radio as HjmRadio,
  RadioGroup as HjmRadioGroup,
  SegmentedControl as HjmSegmentedControl,
  Switch as HjmSwitch,
} from "@hjm/react/selection";
import { Toast as HjmToast } from "@hjm/react/toast";
import {
  AlertDialog as HjmAlertDialog,
  Dialog as HjmDialog,
  Menu as HjmMenu,
  Sheet as HjmSheet,
  Tooltip as HjmTooltip,
} from "@hjm/react/overlays";
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
} from "@hjm/design-contracts";
import {
  showcaseManifest,
  showcaseScenarios,
  type ShowcaseComponentEntry,
} from "@hjm/design-contracts/showcase";

import { useWebDesignSystemEnvironment } from "../runtime/WebDesignSystemProvider";

export type ContractStoryProps = { name: ComponentName };

type CatalogEntry = (typeof componentCatalog)[number];
export const webRendererComponentNames = [
  "Text",
  "Icon",
  "Surface",
  "Stack",
  "Grid",
  "Layout",
  "Button",
  "IconButton",
  "Field",
  "SearchField",
  "TextArea",
  "PasswordField",
  "OtpField",
  "Checkbox",
  "Radio",
  "CheckboxGroup",
  "RadioGroup",
  "Switch",
  "SegmentedControl",
  "Select",
  "Tabs",
  "BottomNavigation",
  "LoadMore",
  "Menu",
  "Badge",
  "CounterBadge",
  "Card",
  "ListRow",
  "Tag",
  "Timeline",
  "DescriptionList",
  "Image",
  "EmptyState",
  "Result",
  "Toast",
  "Dialog",
  "AlertDialog",
  "Sheet",
  "Tooltip",
  "DesignSystemProvider",
] as const satisfies readonly ComponentName[];
export type WebRendererComponentName = (typeof webRendererComponentNames)[number];
type RecipeWebRendererComponentName = Exclude<
  WebRendererComponentName,
  "DesignSystemProvider"
>;
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

type RecipeWebRendererDefinition = Readonly<{
  component: WebRendererCatalogEntry;
  recipe: RecipeBinding;
  behavior: BehaviorBinding | null;
  adapterKind: "recipe-presentation" | "recipe-behavior-presentation";
  evidenceSource: Readonly<{
    owner: "@hjm/design-contracts";
    recipe: RecipeBinding;
    behavior: BehaviorBinding | null;
  }>;
  resolvePresentation(providerValue: DesignSystemProviderValue): RendererPresentation;
  render(providerValue: DesignSystemProviderValue): ReactNode;
}>;

type ProviderWebRendererDefinition = Readonly<{
  component: WebRendererCatalogEntry & Readonly<{
    name: "DesignSystemProvider";
    nonVisualEvidence: "provider-adapter";
  }>;
  recipe: null;
  behavior: null;
  adapterKind: "provider-value-presentation";
  evidenceSource: Readonly<{
    owner: "@hjm/design-contracts";
    contract: "resolveDesignSystemProviderValue";
    recipe: null;
    behavior: null;
  }>;
  resolvePresentation(providerValue: DesignSystemProviderValue): RendererPresentation;
  render(providerValue: DesignSystemProviderValue): ReactNode;
}>;

export type WebRendererDefinition =
  | RecipeWebRendererDefinition
  | ProviderWebRendererDefinition;

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
    "data-hjm-evidence-source": RecipeName | "resolveDesignSystemProviderValue";
    "data-hjm-presentation-signature": string;
  }>;
  consumption: Readonly<{
    sourcePaths: readonly string[];
    recipePaths: readonly string[];
    resolvedColor: string | null;
    resolvedMetric: number | null;
    resolvedMetricProperty: RendererMetricProperty | null;
  }>;
}>;

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));

function ProviderValuePreview({
  providerValue,
}: {
  providerValue: DesignSystemProviderValue;
}) {
  const { environment, palette } = providerValue;
  return (
    <section
      aria-label="Resolved DesignSystemProvider value"
      className="hjm-demo-surface"
      style={{ backgroundColor: palette.theme.surface, color: palette.theme.text }}
    >
      <h3>Resolved environment + palette</h3>
      <dl className="hjm-config">
        <div><dt>Theme</dt><dd>{environment.theme}</dd></div>
        <div><dt>Direction</dt><dd>{environment.direction}</dd></div>
        <div><dt>Text scale</dt><dd>{environment.textScale}</dd></div>
        <div><dt>Reduced motion</dt><dd>{String(environment.reducedMotion)}</dd></div>
      </dl>
      <div className="hjm-preview-row" aria-label="Resolved status accent palette">
        {Object.entries(palette.statusAccents).map(([tone, color]) => (
          <span className="hjm-pill" key={tone} style={{ borderColor: color }}>
            {tone}: {color}
          </span>
        ))}
      </div>
    </section>
  );
}

function assertNever(value: never): never {
  throw new Error(`Missing Web Showcase renderer: ${String(value)}`);
}

/** Only mature, Web-supported contracts can reach this renderer. */
function WebPreviewRenderer({ name }: { name: RecipeWebRendererComponentName }) {
  switch (name) {
    case "Text": return <HjmStack gap="xs"><HjmText as="p" variant="title" emphasis="strong">명확한 제목</HjmText><HjmText as="p">조용한 본문 위계</HjmText><HjmText as="p" tone="muted" variant="label">보조 정보는 한 단계 낮게 표시합니다.</HjmText></HjmStack>;
    case "Icon": return <HjmStack axis="inline" gap="md" wrap role="group" aria-label="Semantic icons"><HjmIcon name="home" decorative={false} accessibilityLabel="홈" /><HjmIcon name="success" decorative={false} accessibilityLabel="성공" tone="success" /><HjmIcon name="warning" decorative={false} accessibilityLabel="경고" tone="warning" /><HjmIcon name="forward" decorative={false} accessibilityLabel="다음" /></HjmStack>;
    case "Surface": return <HjmSurface as="article" bordered className="hjm-demo-surface"><HjmText as="strong">Surface 제목</HjmText><HjmText as="p" tone="muted">제품이 색·간격·모서리를 임의로 덮지 않는 의미 기반 컨테이너입니다.</HjmText></HjmSurface>;
    case "Card": return <HjmCard leading={<span aria-hidden="true">✨</span>} title="Card 제목" description="계약이 보장하는 여백과 정렬로 긴 설명도 안정적으로 표시합니다." actions={<HjmButton size="small">자세히</HjmButton>} />;
    case "Stack": return <HjmStack gap="sm"><HjmButton tone="secondary">첫 번째</HjmButton><HjmButton tone="secondary">두 번째</HjmButton><HjmButton tone="secondary">세 번째</HjmButton></HjmStack>;
    case "Grid": return <HjmGrid columns={{ compact: 1, medium: 2, expanded: 3 }} gap={{ compact: "md" }}><HjmCard title="첫 번째">공통 window class</HjmCard><HjmCard title="두 번째">responsive columns</HjmCard><HjmCard title="세 번째">row-major order</HjmCard></HjmGrid>;
    case "Layout": return <HjmLayout header={<HjmText as="strong">제품 헤더</HjmText>} skipLinkLabel="본문으로 건너뛰기"><HjmSurface as="section" bordered>하나의 main landmark 안에 놓이는 제품 본문입니다.</HjmSurface></HjmLayout>;
    case "Button": return <HjmStack axis="inline" gap="sm" wrap><HjmButton>Primary</HjmButton><HjmButton tone="secondary">Secondary</HjmButton><HjmButton disabled>Disabled</HjmButton></HjmStack>;
    case "IconButton": return <HjmStack axis="inline" gap="sm"><HjmIconButton label="좋아요">♡</HjmIconButton><HjmIconButton label="닫기" tone="ghost">×</HjmIconButton></HjmStack>;
    case "Field": return <HjmField controlId="showcase-player-name" label="이름" description="필수 정보는 입력 아래에서 설명합니다.">{(controlProps) => <input {...controlProps} className="hjm-field__control" defaultValue="홍길동" />}</HjmField>;
    case "SearchField": return <HjmSearchField label="선수 검색" clearLabel="검색어 지우기" defaultValue="야구" description="검색어 지우기 버튼도 키보드로 사용할 수 있습니다." />;
    case "TextArea": return <HjmTextArea label="설명" defaultValue="여러 줄 입력 예시" description="긴 설명도 레이아웃 안에서 줄바꿈됩니다." />;
    case "PasswordField": return <HjmPasswordField label="비밀번호" autofillHint="current" revealLabel="비밀번호 보기" concealLabel="비밀번호 숨기기" defaultValue="hjm-password" description="표시 전환은 값과 독립적으로 동작합니다." />;
    case "OtpField": return <HjmOtpField label="인증번호" length={6} defaultValue="128" description="여섯 자리를 한 번에 입력하거나 붙여넣을 수 있습니다." />;
    case "Checkbox": return <HjmCheckbox label="동의합니다" description="선택 상태와 설명이 함께 노출됩니다." defaultChecked />;
    case "Radio": return <HjmRadio label="단일 선택" description="독립 radio item renderer입니다." name="showcase-radio" defaultChecked />;
    case "CheckboxGroup": return <HjmCheckboxGroup label="선택 그룹" defaultValue={new Set(["first"])} items={[{ id: "first", label: "첫 번째 선택" }, { id: "second", label: "두 번째 선택" }, { id: "disabled", label: "사용할 수 없음", disabled: true }]} />;
    case "RadioGroup": return <HjmRadioGroup label="선택 그룹" defaultValue="first" items={[{ value: "first", label: "첫 번째 선택" }, { value: "second", label: "두 번째 선택" }, { value: "disabled", label: "사용할 수 없음", disabled: true }]} />;
    case "Switch": return <HjmSwitch label="알림 받기" defaultChecked />;
    case "SegmentedControl": return <HjmSegmentedControl label="보기 방식" defaultValue="list" items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]} />;
    case "Select": return <HjmSelect label="언어" name="language" placeholder="언어 선택" emptySelectionLabel="선택 안 함" defaultSelectedKey="ko" items={[{ id: "ko", label: "한국어", textValue: "한국어" }, { id: "en", label: "English", textValue: "English" }]} />;
    case "Tabs": return <HjmTabs label="선수 정보" items={[{ id: "first", label: "첫 번째", panel: "첫 번째 패널 내용" }, { id: "second", label: "두 번째", panel: "두 번째 패널 내용" }]} />;
    case "BottomNavigation": return <HjmBottomNavigation descriptor={{ accessibilityLabel: "주요 탐색", selectedKey: "home", items: [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "profile", label: "프로필", icon: { name: "user" } }] }} getHref={({ id }) => `#${id}`} renderIcon={({ name }) => <HjmIcon name={name} />} />;
    case "LoadMore": return <HjmLoadMore descriptor={{ state: { status: "ready", requestKey: "showcase-next" }, labels: { loadMore: "더 보기", loading: "불러오는 중", retry: "다시 시도", complete: "모두 불러왔습니다" } }} onLoadMore={async () => undefined} />;
    case "Menu": return <HjmMenu trigger={<button className="hjm-demo-button" type="button">작업 열기</button>} label="선수 작업" items={[{ id: "rename", label: "이름 바꾸기", onSelect: () => undefined }, { id: "share", label: "공유하기", onSelect: () => undefined }, { id: "delete", label: "삭제", tone: "danger", onSelect: () => undefined }]} />;
    case "Badge": return <HjmStack axis="inline" gap="sm"><HjmBadge>진행 중</HjmBadge><HjmBadge tone="success">완료</HjmBadge></HjmStack>;
    case "CounterBadge": return <HjmIconButton label="알림 12개"><HjmIcon name="notifications" /><HjmCounterBadge count={12} /></HjmIconButton>;
    case "ListRow": return <HjmListRow title="홍길동" description="선수 상세 보기" leading={<span className="hjm-avatar">홍</span>} trailing={<span aria-hidden>›</span>} onClick={() => undefined} />;
    case "Tag": return <HjmStack axis="inline" gap="sm" wrap><HjmTag>내야수</HjmTag><HjmTag tone="success">등록 선수</HjmTag><HjmTag>2026 시즌</HjmTag></HjmStack>;
    case "Timeline": return <HjmTimeline composeAccessibleName={({ position, total, label }) => `${total}개 중 ${position}번째, ${label}`} items={[{ id: "created", label: "아이디어 생성", timestamp: "10:00", tone: "info" }, { id: "completed", label: "실행 완료", timestamp: "10:12", description: "결과를 저장했습니다.", tone: "success" }]} />;
    case "DescriptionList": return <HjmDescriptionList items={[{ id: "status", label: "상태", value: "준비됨" }, { id: "owner", label: "담당", value: "홍길동" }]} />;
    case "Image": return <HjmImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dbeafe'/%3E%3C/svg%3E" width={320} height={180} decorative={false} accessibilityLabel="연한 파란색 이미지 예시" />;
    case "EmptyState": return <HjmEmptyState icon="◇" title="아직 항목이 없어요" description="새 항목을 추가하면 여기에 표시됩니다." action={<HjmButton>추가하기</HjmButton>} />;
    case "Result": return <HjmResult status="success" title="저장했어요" description="변경 사항이 모든 기기에 반영되었습니다." actions={[{ label: "확인", onAction: () => undefined }]} />;
    case "Toast": return <HjmToast descriptor={{ id: "showcase-saved", tone: "success", title: "저장했어요", description: "변경 사항이 반영되었습니다.", closeLabel: "닫기" }} onDismissRequest={() => undefined} />;
    case "Dialog": return <HjmDialog trigger={<button className="hjm-demo-button" type="button">Dialog 열기</button>} title="Dialog 제목" closeLabel="Dialog 닫기" description="긴 설명도 잘리지 않고 행동의 결과를 명확하게 전달합니다." footer={<HjmButton>확인</HjmButton>}><p>키보드 포커스는 이 대화상자 안에 유지됩니다.</p></HjmDialog>;
    case "AlertDialog": return <HjmAlertDialog trigger={<button className="hjm-demo-button" type="button">AlertDialog 열기</button>} request={{ mode: "confirm", tone: "danger", title: "기록 삭제", description: "이 작업은 되돌릴 수 없습니다.", confirmLabel: "삭제", cancelLabel: "취소", onConfirm: async () => undefined, fallbackErrorMessage: "삭제하지 못했습니다." }} />;
    case "Sheet": return <HjmSheet trigger={<button className="hjm-demo-button" type="button">Sheet 열기</button>} title="필터" closeLabel="필터 닫기" description="화면 크기와 방향에 맞춰 배치되는 보조 작업 영역입니다." footer={<HjmButton>적용</HjmButton>}><p>조건을 선택한 뒤 적용하세요.</p></HjmSheet>;
    case "Tooltip": return <HjmTooltip trigger={<button className="hjm-demo-button" type="button">도움말에 포커스하거나 가리키기</button>} content="자세한 도움말" />;
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
  adapterKind: RecipeWebRendererDefinition["adapterKind"],
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
      sourcePaths: recipePaths,
      recipePaths,
      resolvedColor: resolvedColor?.value ?? null,
      resolvedMetric: typeof metric?.value === "number" ? metric.value : null,
      resolvedMetricProperty: metricProperty,
    },
  };
}

const providerValueSourcePaths = [
  "environment.theme",
  "environment.direction",
  "environment.textScale",
  "environment.reducedMotion",
  "palette.theme.bg",
  "palette.theme.surface",
  "palette.theme.text",
  "palette.statusAccents.info",
  "palette.statusAccents.success",
  "palette.statusAccents.warning",
  "palette.statusAccents.attention",
] as const;

function resolveProviderValuePresentation(
  providerValue: DesignSystemProviderValue,
): RendererPresentation {
  const { environment, palette } = providerValue;
  const signature = presentationSignature(JSON.stringify({
    environment,
    palette: {
      background: palette.theme.bg,
      surface: palette.theme.surface,
      text: palette.theme.text,
      statusAccents: palette.statusAccents,
    },
  }));
  return {
    style: {
      "--hjm-evidence-color": palette.theme.text,
      "--hjm-evidence-leaf-count": providerValueSourcePaths.length,
      "--hjm-evidence-signature": signature,
      backgroundColor: palette.theme.bg,
      color: palette.theme.text,
      direction: environment.direction,
      fontSize: `calc(var(--hjm-type-body-size) * ${environment.textScale})`,
    },
    attributes: {
      "data-hjm-adapter-kind": "provider-value-presentation",
      "data-hjm-consumed-paths": providerValueSourcePaths.join(","),
      "data-hjm-evidence-source": "resolveDesignSystemProviderValue",
      "data-hjm-presentation-signature": signature,
    },
    consumption: {
      sourcePaths: providerValueSourcePaths,
      recipePaths: [],
      resolvedColor: palette.theme.text,
      resolvedMetric: null,
      resolvedMetricProperty: null,
    },
  };
}

function createWebRendererDefinition(
  name: RecipeWebRendererComponentName,
  recipeName: RecipeName,
  behaviorName: BehaviorName | null = null,
): RecipeWebRendererDefinition {
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
      owner: "@hjm/design-contracts",
      recipe,
      behavior,
    },
    resolvePresentation: (providerValue) =>
      resolveRecipePresentation(recipe, adapterKind, providerValue),
    render: () => <WebPreviewRenderer name={name} />,
  };
}

function createProviderWebRendererDefinition(): ProviderWebRendererDefinition {
  const component = componentCatalog.find(
    (entry) => entry.name === "DesignSystemProvider",
  );
  if (!component) {
    throw new Error("DesignSystemProvider is missing from the canonical catalog");
  }
  const contract: ComponentCatalogEntry = component;
  if (
    contract.status !== "beta" ||
    contract.platform === "native" ||
    contract.nonVisualEvidence !== "provider-adapter" ||
    contract.recipe !== undefined ||
    contract.behavior !== undefined
  ) {
    throw new Error("DesignSystemProvider must bind the nonvisual provider-adapter evidence");
  }
  const providerComponent = component as ProviderWebRendererDefinition["component"];
  return {
    component: providerComponent,
    recipe: null,
    behavior: null,
    adapterKind: "provider-value-presentation",
    evidenceSource: {
      owner: "@hjm/design-contracts",
      contract: "resolveDesignSystemProviderValue",
      recipe: null,
      behavior: null,
    },
    resolvePresentation: resolveProviderValuePresentation,
    render: (providerValue) => <ProviderValuePreview providerValue={providerValue} />,
  };
}

/** Explicit renderer evidence: catalog maturity alone cannot create a preview. */
export const webRendererRegistry = {
  Text: createWebRendererDefinition("Text", "textRecipe"),
  Icon: createWebRendererDefinition("Icon", "iconRecipe"),
  Surface: createWebRendererDefinition("Surface", "surfaceRecipe"),
  Stack: createWebRendererDefinition("Stack", "stackRecipe"),
  Grid: createWebRendererDefinition("Grid", "gridRecipe"),
  Layout: createWebRendererDefinition("Layout", "layoutRecipe", "layout"),
  Button: createWebRendererDefinition("Button", "buttonRecipe"),
  IconButton: createWebRendererDefinition("IconButton", "iconButtonRecipe"),
  Field: createWebRendererDefinition("Field", "fieldRecipe", "field"),
  SearchField: createWebRendererDefinition("SearchField", "searchFieldRecipe", "searchField"),
  TextArea: createWebRendererDefinition("TextArea", "fieldRecipe"),
  PasswordField: createWebRendererDefinition("PasswordField", "passwordFieldRecipe", "passwordField"),
  OtpField: createWebRendererDefinition("OtpField", "otpFieldRecipe", "otpField"),
  Checkbox: createWebRendererDefinition("Checkbox", "selectionControlRecipe", "checkbox"),
  Radio: createWebRendererDefinition("Radio", "selectionControlRecipe"),
  CheckboxGroup: createWebRendererDefinition("CheckboxGroup", "selectionGroupRecipe", "checkboxGroup"),
  RadioGroup: createWebRendererDefinition("RadioGroup", "selectionGroupRecipe", "radioGroup"),
  Switch: createWebRendererDefinition("Switch", "switchRecipe", "switch"),
  SegmentedControl: createWebRendererDefinition("SegmentedControl", "segmentedControlRecipe", "segmentedControl"),
  Select: createWebRendererDefinition("Select", "selectRecipe", "select"),
  Tabs: createWebRendererDefinition("Tabs", "tabsRecipe", "tabs"),
  BottomNavigation: createWebRendererDefinition("BottomNavigation", "bottomNavigationRecipe", "bottomNavigation"),
  LoadMore: createWebRendererDefinition("LoadMore", "loadMoreRecipe", "loadMore"),
  Menu: createWebRendererDefinition("Menu", "menuRecipe", "menu"),
  Badge: createWebRendererDefinition("Badge", "badgeRecipe"),
  CounterBadge: createWebRendererDefinition("CounterBadge", "counterBadgeRecipe"),
  Card: createWebRendererDefinition("Card", "cardRecipe"),
  ListRow: createWebRendererDefinition("ListRow", "listRowRecipe"),
  Tag: createWebRendererDefinition("Tag", "tagRecipe"),
  Timeline: createWebRendererDefinition("Timeline", "timelineRecipe"),
  DescriptionList: createWebRendererDefinition("DescriptionList", "descriptionListRecipe"),
  Image: createWebRendererDefinition("Image", "imageRecipe"),
  EmptyState: createWebRendererDefinition("EmptyState", "emptyStateRecipe"),
  Result: createWebRendererDefinition("Result", "resultRecipe"),
  Toast: createWebRendererDefinition("Toast", "toastRecipe", "toast"),
  Dialog: createWebRendererDefinition("Dialog", "dialogRecipe", "dialog"),
  AlertDialog: createWebRendererDefinition("AlertDialog", "alertDialogRecipe", "alertDialog"),
  Sheet: createWebRendererDefinition("Sheet", "sheetRecipe", "sheet"),
  Tooltip: createWebRendererDefinition("Tooltip", "tooltipRecipe", "tooltip"),
  DesignSystemProvider: createProviderWebRendererDefinition(),
} satisfies Readonly<Record<WebRendererComponentName, WebRendererDefinition>>;

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
    contractOnly: canonicalCatalog.filter((entry) => {
      const status = entry.surfaceStatus?.web;
      return status === "planned" || status === "deprecated";
    }).length,
    nativeOnly: canonicalCatalog.filter(
      ({ surfaceStatus }) => surfaceStatus?.web === "unsupported",
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
      data-hjm-recipe={definition.recipe?.name ?? "none"}
      data-hjm-renderer={name}
      style={presentation.style}
    >
      {definition.render(providerValue)}
    </div>
  );
}

function StoryHeader({ entry }: { entry: ShowcaseComponentEntry }) {
  const { component } = entry;
  return (
    <>
      <p className="hjm-eyebrow">{component.category} · {component.platform}</p>
      <h1 className="hjm-title">{component.name}</h1>
      <div className="hjm-meta-row"><span className="hjm-pill" data-status={component.status}>contract: {component.status}</span><span className="hjm-pill" data-status={entry.surfaceMaturity.web}>web: {entry.surfaceMaturity.web}</span><span className="hjm-pill" data-status={entry.surfaceMaturity.native}>native: {entry.surfaceMaturity.native}</span>{component.behavior && <span className="hjm-pill">behavior: {component.behavior}</span>}{component.recipe && <span className="hjm-pill">recipe: {component.recipe}</span>}</div>
      {component.roadmap && <section className="hjm-roadmap-callout" data-roadmap={component.roadmap.state}><span>{component.roadmap.state}</span><p>{component.roadmap.summary}</p>{component.roadmap.targets && <small>Composed with: {component.roadmap.targets.join(" + ")}</small>}</section>}
    </>
  );
}

function EvidenceSection({ entry, contract }: { entry: ShowcaseComponentEntry; contract: string }) {
  return (
    <section className="hjm-section" aria-labelledby={`${entry.component.name}-evidence`}>
      <h2 className="hjm-section-title" id={`${entry.component.name}-evidence`}>Required evidence</h2>
      <div className="hjm-grid"><article className="hjm-card"><h3>Surfaces</h3><p>{entry.requiredSurfaces.join(" · ")}</p></article><article className="hjm-card"><h3>Required scenarios</h3><ul className="hjm-requirement-list">{entry.requiredScenarios.map((id) => <li key={id}>{scenarioLabels.get(id)}</li>)}</ul></article><article className="hjm-card"><h3>Contract</h3><p>{contract}</p></article></div>
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
  const webStatus = entry.surfaceMaturity.web;
  if (webStatus === "planned" || webStatus === "deprecated") {
    return <ContractOnlyStory entry={entry} />;
  }
  if (webStatus === "unsupported") {
    return <UnsupportedWebStory entry={entry} />;
  }
  if (!isWebRendererComponent(name)) {
    throw new Error(`Mature Web component is missing a renderer registration: ${name}`);
  }
  return <InteractiveWebStory entry={entry} name={name} />;
}
