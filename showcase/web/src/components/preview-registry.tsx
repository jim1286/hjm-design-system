import { DialogPreview, AlertDialogPreview } from "./dialog-examples.js";
import { WebAdditionsPreview } from "../patterns/WebAdditions.previews.js";
import { calendarExampleGrid } from "../../../shared/calendar-example.js";
import { DataLayoutPreview } from "../patterns/DataLayouts.previews.js";
import { ThinkingOrb } from "@hjmds/react/thinking-orb";
import { PopoverPreview } from "../patterns/Popover.previews.js";
import { SidePanelPreview } from "../patterns/SidePanel.previews.js";
import { SplitterPreview } from "../patterns/Splitter.previews.js";
import { TourPreview } from "../patterns/Tour.previews.js";
import { TreePreview } from "../patterns/Tree.previews.js";
import { TransferListPreview, MentionsPreview } from "../patterns/TransferList.previews.js";
import { CommandPalettePreview, DataTablePreview } from "../patterns/CommandPalette.previews.js";
import { ChartGalleryPreview } from "../patterns/Chart.previews.js";
import { AgreementPreview, TopPreview, AuthProviderButtonPreview, AuthScreenLayoutPreview } from "../patterns/Agreement.previews.js";
import { HeadingPreview } from "../patterns/Heading.previews.js";
import { ToggleGroupPreview, TagsInputPreview } from "../patterns/ToggleGroup.previews.js";
import { SidebarPreview, BottomInfoPreview } from "../patterns/Sidebar.previews.js";
import { DateRangePreview } from "../patterns/DateRange.previews.js";
import { TextFormatPreview } from "../patterns/TextFormat.previews.js";
import { CollapsiblePreview, ContextMenuPreview, MenubarPreview } from "../patterns/Disclosure.previews.js";
import { AssetPreview } from "../patterns/Asset.previews.js";
import { WebNavigationPreview } from "../patterns/WebNavigation.previews.js";
import { AnchorPreview } from "../patterns/Anchor.previews.js";
import { CalendarPreview } from "../patterns/Calendar.previews.js";
import { FloatingActionButton as HjmFloatingActionButton } from "@hjmds/react/floating-action-button";
import { Carousel as HjmCarousel } from "@hjmds/react/carousel";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  categoryLabels,
  platformLabels,
  roadmapStateLabels,
  roadmapStateTones,
  statusLabels,
  statusTones,
  surfaceLabels,
} from "./showcase-labels.js";
import {
  Button as HjmButton,
  IconButton as HjmIconButton,
  Link as HjmLink,
} from "@hjmds/react/actions";
import {
  Accordion as HjmAccordion,
  Avatar as HjmAvatar,
  Badge as HjmBadge,
  Card as HjmCard,
  CounterBadge as HjmCounterBadge,
  DescriptionList as HjmDescriptionList,
  Divider as HjmDivider,
  Icon as HjmIcon,
  Image as HjmImage,
  List as HjmList,
  ListRow as HjmListRow,
  Statistic as HjmStatistic,
  Tag as HjmTag,
  Timeline as HjmTimeline,
} from "@hjmds/react/display";
import {
  EmptyState as HjmEmptyState,
  Notice as HjmNotice,
  Progress as HjmProgress,
  Result as HjmResult,
  Skeleton as HjmSkeleton,
  Spinner as HjmSpinner,
} from "@hjmds/react/feedback";
import {
  Combobox as HjmCombobox,
  Field as HjmField,
  Form as HjmForm,
  SearchField as HjmSearchField,
  Select as HjmSelect,
  TextArea as HjmTextArea,
} from "@hjmds/react/forms";
import { NumberField as HjmNumberField } from "@hjmds/react/number-field";
import { DatePicker as HjmDatePicker } from "@hjmds/react/date-picker";
import { FilePicker as HjmFilePicker } from "@hjmds/react/file-picker";
import { OtpField as HjmOtpField } from "@hjmds/react/otp-field";
import { PasswordField as HjmPasswordField } from "@hjmds/react/password-field";
import {
  AspectRatio as HjmAspectRatio,
  Container as HjmContainer,
  Grid as HjmGrid,
  Layout as HjmLayout,
  Section as HjmSection,
  Stack as HjmStack,
  Surface as HjmSurface,
  Text as HjmText,
  VisuallyHidden as HjmVisuallyHidden,
} from "@hjmds/react/layout";
import { Slider as HjmSlider } from "@hjmds/react/slider";
import { Steps as HjmSteps } from "@hjmds/react/steps";
import { UploadItem as HjmUploadItem } from "@hjmds/react/upload-item";
import { TopBar as HjmTopBar } from "@hjmds/react/top-bar";
import { BottomCTA as HjmBottomCTA } from "@hjmds/react/bottom-cta";
import {
  BottomNavigation as HjmBottomNavigation,
  LoadMore as HjmLoadMore,
  Tabs as HjmTabs,
} from "@hjmds/react/navigation";
import {
  Checkbox as HjmCheckbox,
  CheckboxGroup as HjmCheckboxGroup,
  Chip as HjmChip,
  Radio as HjmRadio,
  RadioGroup as HjmRadioGroup,
  SegmentedControl as HjmSegmentedControl,
  Switch as HjmSwitch,
} from "@hjmds/react/selection";
import { Toast as HjmToast } from "@hjmds/react/toast";
import {
  Menu as HjmMenu,
  Sheet as HjmSheet,
  Tooltip as HjmTooltip,
} from "@hjmds/react/overlays";
import {
  behaviorRegistry,
  componentCatalog,
  getComponentSurfaceStatus,
  recipeRegistry,
  resolveColorReference,
  resolveDesignSystemProviderValue,
  type BehaviorName,
  type ColorReference,
  type ComponentCatalogEntry,
  type ComponentName,
  type ComponentPlatform,
  type ComponentSurfaceStatus,
  type DesignSystemProviderValue,
  type RecipeName,
} from "@hjmds/design-contracts";
import {
  showcaseManifest,
  showcaseScenarios,
  type ShowcaseComponentEntry,
} from "@hjmds/design-contracts/showcase";

import { useWebDesignSystemEnvironment } from "../runtime/WebDesignSystemProvider";
import { ImageChoicePreview } from "../patterns/image-choice-preview.js";
import { storyLabels } from "../../../shared/story-labels.js";
import {
  aspectRatioExample,
  bottomCtaExample,
  buttonExample,
  containerExample,
  dividerExample,
  floatingActionExample,
  gridExample,
  iconButtonExample,
  iconExample,
  layoutExample,
  linkExample,
  sectionExample,
  stackExample,
  surfaceExample,
  textExample,
  checkboxExample,
  checkboxGroupExample,
  chipExample,
  comboboxExample,
  datePickerExample,
  fieldExample,
  filePickerExample,
  formExample,
  numberFieldExample,
  otpFieldExample,
  passwordFieldExample,
  radioExample,
  radioGroupExample,
  searchFieldExample,
  segmentedControlExample,
  selectExample,
  sliderExample,
  switchExample,
  textAreaExample,
  bottomNavigationExample,
  loadMoreExample,
  menuExample,
  sheetExample,
  stepsExample,
  tabsExample,
  tooltipExample,
  topBarExample,
  accordionExample,
  avatarExample,
  badgeExample,
  cardExample,
  counterBadgeExample,
  descriptionListExample,
  imageExample,
  listExample,
  listRowExample,
  statisticExample,
  tagExample,
  timelineExample,
  uploadItemExample,
  resultExample,
  noticeExample,
  progressExample,
  skeletonExample,
  spinnerExample,
  designSystemProviderExample,
  skipNavExample,
  visuallyHiddenExample,
  toastExample,
} from "../../../shared/component-examples.js";
import { SkipNav as HjmSkipNav } from "@hjmds/react/skip-nav";
import { PreviewTools, PreviewToolButton } from "../patterns/preview-tools.js";
import mountainPhoto from "../../../shared/photos/mountain.jpg";

// The old empty-state button had no handler. Keep creation and search recovery observable
// without adding a second data-state engine; this is a local, disposable fixture.

// Same cases as the Native preview (shared skeletonExample): shapes, list-row and card placeholders under one busy label.
function SkeletonPreview() {
  const { sections, textLines, rowLines, rowCount, cardLines, buttonWidth } = skeletonExample;
  return <HjmStack gap="lg" role="status" aria-label={skeletonExample.label} aria-busy="true">
    <HjmStack gap="sm"><HjmText as="p" variant="label" tone="muted">{sections.shapes}</HjmText>
      <HjmSkeleton shape="text" lines={textLines} />
      <HjmStack axis="inline" gap="sm" align="center"><HjmSkeleton shape="circle" /><HjmSkeleton shape="button" width={buttonWidth} /><HjmSkeleton shape="button" buttonShape="pill" width={buttonWidth} /></HjmStack>
      <HjmSkeleton shape="media" />
    </HjmStack>
    <HjmStack gap="sm"><HjmText as="p" variant="label" tone="muted">{sections.listRow}</HjmText>
      {Array.from({ length: rowCount }, (_, index) => <HjmStack key={index} axis="inline" gap="sm" align="center"><HjmSkeleton shape="circle" /><HjmSkeleton shape="text" lines={rowLines} layoutStyle={{ flex: 1 }} /></HjmStack>)}
    </HjmStack>
    <HjmStack gap="sm"><HjmText as="p" variant="label" tone="muted">{sections.card}</HjmText>
      <HjmSurface bordered padding="md"><HjmStack gap="sm"><HjmSkeleton shape="media" /><HjmSkeleton shape="text" lines={cardLines} /><HjmSkeleton shape="button" /></HjmStack></HjmSurface>
    </HjmStack>
  </HjmStack>;
}

function EmptyStateRecoveryPreview() {
  const [created, setCreated] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const found = created && "예시 초안".includes(query.trim());
  const focusSearch = () => input.current?.focus();
  return <HjmStack gap="md">
    <HjmSearchField ref={input} label="초안 검색" clearLabel="검색어 지우기" value={query} onValueChange={setQuery} />
    {!created ? <HjmEmptyState title="아직 초안이 없어요" description="첫 초안을 만들면 여기에 표시됩니다."
      density="compact" aria-live="off" action={<HjmButton onClick={() => { setCreated(true); setQuery(""); focusSearch(); }}>예시 초안 만들기</HjmButton>} /> :
      !found ? <HjmEmptyState title="검색 결과가 없어요" description="검색어를 바꾸거나 지우면 초안을 다시 볼 수 있습니다."
        density="compact" action={<HjmButton tone="secondary" onClick={() => { setQuery(""); focusSearch(); }}>검색어 지우고 모두 보기</HjmButton>} /> :
        <HjmList label="초안 목록"><HjmListRow title="예시 초안" description="이 화면에서만 유지되는 항목" /></HjmList>}
    {created ? <HjmButton tone="secondary" onClick={() => { setCreated(false); setQuery(""); focusSearch(); }}>처음 상태로 돌아가기</HjmButton> : null}
  </HjmStack>;
}

export type ContractStoryProps = { name: ComponentName };

type CatalogEntry = (typeof componentCatalog)[number];
export const webRendererComponentNames = [
  "TopBar",
  "BottomCTA",
  "Text",
  "Icon",
  "Surface",
  "Stack",
  "Container",
  "AspectRatio",
  "Grid",
  "Layout",
  "Button",
  "IconButton",
  "Link",
  "Field",
  "SearchField",
  "TextArea",
  "PasswordField",
  "OtpField",
  "ImageChoiceGroup",
  "NumberField",
  "Slider",
  "Form",
  "DatePicker",
  "FilePicker",
  "Checkbox",
  "Radio",
  "CheckboxGroup",
  "RadioGroup",
  "Switch",
  "SegmentedControl",
  "Chip",
  "Select",
  "Combobox",
  "Tabs",
  "BottomNavigation",
  "LoadMore",
  "Steps",
  "Carousel",
  "FloatingActionButton",
  "Calendar",
  "Breadcrumb",
  "Pagination",
  "Anchor",
  "Popover",
  "SidePanel",
  "Splitter",
  "Tour",
  "Tree",
  "TransferList",
  "Mentions",
  "CommandPalette",
  "DataTable",
  "Chart",
  "Collapsible",
  "Asset",
  "ContextMenu",
  "Menubar",
  "Agreement",
  "AuthProviderButton",
  "AuthScreenLayout",
  "Top",
  "Heading",
  "ToggleGroup",
  "TagsInput",
  "Sidebar",
  "BottomInfo",
  "SkipNav",
  "DateRangePicker",
  "TextFormat",
  "Menu",
  "Badge",
  "Avatar",
  "CounterBadge",
  "Card",
  "List",
  "ListRow",
  "Tag",
  "Accordion",
  "Divider",
  "Statistic",
  "Section",
  "UploadItem",
  "Timeline",
  "DescriptionList",
  "Image",
  "EmptyState",
  "Notice",
  "Progress",
  "ThinkingOrb",
  "ColorPicker", "Watermark", "Affix",
  "Masonry",
  "VirtualList",
  "QRCode",
  "Spinner",
  "Skeleton",
  "Result",
  "Toast",
  "Dialog",
  "AlertDialog",
  "Sheet",
  "Tooltip",
  "VisuallyHidden",
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
    owner: "@hjmds/design-contracts";
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
    owner: "@hjmds/design-contracts";
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
  // `aspectRatio`는 px가 아니라 비율이다. AspectRatio의 계약값(`ratios.*`)은 색도 길이도
  // 아니어서 이 어휘에 들어오지 못했고, 그래서 presentation이 계약값을 하나도 소비하지
  // 못한 채 남아 있었다 (#21). 실제 웹 renderer도 같은 값을 CSS `aspect-ratio`로 쓴다.
  | "aspectRatio"
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
      aria-label={designSystemProviderExample.title}
      className="hjm-demo-surface"
      // Raw values ("success: #16a34a") have no break opportunity; at 2x text they widened the stage grid track
      // past a 390 viewport and made the stage a keyboard-unreachable scroll region (2026-10-06 render sweep).
      style={{ backgroundColor: palette.theme.bg, color: palette.theme.text, overflowWrap: "anywhere" }}
    >
      <h3>{designSystemProviderExample.title}</h3>
      <dl className="hjm-config">
        <div><dt>{designSystemProviderExample.theme}</dt><dd>{environment.theme}</dd></div>
        <div><dt>{designSystemProviderExample.direction}</dt><dd>{environment.direction}</dd></div>
        <div><dt>{designSystemProviderExample.textScale}</dt><dd>{environment.textScale}</dd></div>
        <div><dt>{designSystemProviderExample.reducedMotion}</dt><dd>{String(environment.reducedMotion)}</dd></div>
      </dl>
      <div className="hjm-preview-row" aria-label={designSystemProviderExample.palette}>
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

// Derive weekday placement from the shared calendar fixture; hand-written offsets put February 1, 2027 under Wednesday instead of Monday.
const previewCalendarGrid = calendarExampleGrid(datePickerExample.month);

/** Only mature, Web-supported contracts can reach this renderer. */
function WebPreviewRenderer({ name }: { name: RecipeWebRendererComponentName }) {
  switch (name) {
    case "Text": return <HjmStack gap="xs"><HjmText as="p" variant="title" emphasis="strong">{textExample.title}</HjmText><HjmText as="p">{textExample.body}</HjmText><HjmText as="p" tone="muted" variant="label">{textExample.caption}</HjmText></HjmStack>;
    case "Icon": return <HjmStack axis="inline" gap="md" wrap role="group" aria-label={iconExample.label}>{iconExample.items.map((item) => <HjmIcon key={item.name} name={item.name} decorative={false} accessibilityLabel={item.label} {...("tone" in item ? { tone: item.tone } : {})} />)}</HjmStack>;
    case "Surface": return <HjmSurface as="article" bordered padding="lg"><HjmStack gap="xs"><HjmText as="strong">{surfaceExample.title}</HjmText><HjmText as="p" tone="muted">{surfaceExample.body}</HjmText></HjmStack></HjmSurface>;
    case "Card": return <ObservablePreview>{({ setMessage }) => <HjmCard title={cardExample.title} description={cardExample.description} actions={<HjmButton size="small" tone="secondary" onClick={() => setMessage(cardExample.result)}>{cardExample.action}</HjmButton>} />}</ObservablePreview>;
    case "Stack": return <HjmStack gap="sm">{stackExample.map((label) => <HjmSurface key={label} bordered padding="sm"><HjmText>{label}</HjmText></HjmSurface>)}</HjmStack>;
    case "Container": return <HjmContainer size="reading"><HjmSurface bordered padding="md"><HjmText>{containerExample}</HjmText></HjmSurface></HjmContainer>;
    case "AspectRatio": return <HjmContainer size="reading"><HjmAspectRatio ratio="wide"><HjmSurface bordered tone="subtle" padding="md"><HjmText tone="muted">{aspectRatioExample}</HjmText></HjmSurface></HjmAspectRatio></HjmContainer>;
    case "Grid": return <HjmGrid columns={{ compact: 1, medium: 2, expanded: 3 }} gap={{ compact: "md" }}>{gridExample.map((item) => <HjmCard key={item.id} title={item.title}>{item.body}</HjmCard>)}</HjmGrid>;
    case "Layout": return <HjmLayout header={<HjmText as="strong">{layoutExample.header}</HjmText>} skipLinkLabel={layoutExample.skipLink}><HjmSurface as="section" bordered padding="md"><HjmText>{layoutExample.body}</HjmText></HjmSurface></HjmLayout>;
    case "Button": return <ObservablePreview>{({ setMessage }) => <HjmStack axis="inline" gap="md" wrap><HjmButton onClick={() => setMessage(buttonExample.primary.result)}>{buttonExample.primary.label}</HjmButton><HjmButton tone="secondary" onClick={() => setMessage(buttonExample.secondary.result)}>{buttonExample.secondary.label}</HjmButton><HjmButton disabled>{buttonExample.disabled}</HjmButton></HjmStack>}</ObservablePreview>;
    case "IconButton": return <ObservablePreview>{({ setMessage }) => <HjmStack axis="inline" gap="md">{iconButtonExample.map((item) => <HjmIconButton key={item.icon} label={item.label} tone={item.tone} onClick={() => setMessage(item.result)}><HjmIcon name={item.icon} /></HjmIconButton>)}</HjmStack>}</ObservablePreview>;
    case "Link": return <HjmLink href={`#${linkExample.href.slice(1)}`}>{linkExample.label}</HjmLink>;
    case "Field": return <HjmField className="hjm-demo-field" controlId="showcase-player-name" label={fieldExample.label} description={fieldExample.description}>{(controlProps) => <input {...controlProps} defaultValue={fieldExample.value} />}</HjmField>;
    case "SearchField": return <HjmSearchField label={searchFieldExample.label} clearLabel={searchFieldExample.clearLabel} defaultValue={searchFieldExample.value} description={searchFieldExample.description} />;
    case "TextArea": return <HjmTextArea label={textAreaExample.label} defaultValue={textAreaExample.value} description={textAreaExample.description} />;
    case "PasswordField": return <HjmPasswordField label={passwordFieldExample.label} autofillHint="current" revealLabel={passwordFieldExample.revealLabel} concealLabel={passwordFieldExample.concealLabel} defaultValue={passwordFieldExample.value} description={passwordFieldExample.description} />;
    case "ImageChoiceGroup": return <ImageChoicePreview />;
    case "OtpField": return <HjmOtpField label={otpFieldExample.label} length={otpFieldExample.length} defaultValue={otpFieldExample.value} description={otpFieldExample.description} />;
    case "NumberField": return <HjmNumberField label={numberFieldExample.label} min={numberFieldExample.min} max={numberFieldExample.max} defaultValue={numberFieldExample.value} decrementLabel={numberFieldExample.decrementLabel} incrementLabel={numberFieldExample.incrementLabel} />;
    case "Slider": return <HjmSlider label={sliderExample.label} min={sliderExample.min} max={sliderExample.max} defaultValue={sliderExample.value} getValueText={sliderExample.valueText} />;
    case "Form": return <ObservablePreview>{({ setMessage }) => <HjmForm onSubmit={() => setMessage(formExample.result)} actions={<HjmButton type="submit">{formExample.submit}</HjmButton>}><HjmSearchField label={formExample.field.label} clearLabel={formExample.field.clearLabel} defaultValue={formExample.field.value} /></HjmForm>}</ObservablePreview>;
    case "DatePicker": return <DatePickerPreview />;
    case "FilePicker": return <ObservablePreview>{({ setMessage }) => <HjmFilePicker buttonLabel={filePickerExample.buttonLabel} descriptor={{ mode: "multiple", accept: ["image/*"], maxCount: 4 }} dropzoneLabel={filePickerExample.dropzoneLabel} hint={filePickerExample.hint} label={filePickerExample.label} onSelect={() => setMessage(filePickerExample.result)} />}</ObservablePreview>;
    case "Checkbox": return <HjmCheckbox label={checkboxExample.label} description={checkboxExample.description} defaultChecked={checkboxExample.checked} />;
    case "Radio": return <HjmRadio label={radioExample.label} description={radioExample.description} name="showcase-radio" defaultChecked={radioExample.checked} />;
    case "CheckboxGroup": return <HjmCheckboxGroup label={checkboxGroupExample.label} defaultValue={new Set<string>(checkboxGroupExample.initial)} items={checkboxGroupExample.items} />;
    case "RadioGroup": return <HjmRadioGroup label={radioGroupExample.label} defaultValue={radioGroupExample.initial} items={radioGroupExample.items} />;
    case "Switch": return <HjmSwitch label={switchExample.label} defaultChecked={switchExample.checked} />;
    case "SegmentedControl": return <HjmSegmentedControl label={segmentedControlExample.label} defaultValue={segmentedControlExample.initial} items={segmentedControlExample.items} />;
    case "Chip": return <ChipPreview />;
    case "Select": return <HjmSelect label={selectExample.label} name="language" placeholder={selectExample.placeholder} emptySelectionLabel={selectExample.emptySelectionLabel} defaultSelectedKey={selectExample.initial} items={selectExample.items} />;
    case "Combobox": return <HjmCombobox label={comboboxExample.label} placeholder={comboboxExample.placeholder} emptyMessage={comboboxExample.emptyMessage} loadingMessage={comboboxExample.loadingMessage} selectionRequiredMessage={comboboxExample.selectionRequiredMessage} items={comboboxExample.items.map(({ id, label }) => ({ value: id, label }))} />;
    case "Tabs": return <HjmTabs label={tabsExample.label} items={tabsExample.items} />;
    case "BottomNavigation": return <BottomNavigationPreview />;
    case "LoadMore": return <LoadMorePreview />;
    case "Breadcrumb":
    case "Pagination": return <WebNavigationPreview />;
    case "Popover": return <PopoverPreview />;
    case "SidePanel": return <SidePanelPreview />;
    case "Splitter": return <SplitterPreview />;
    case "Tour": return <TourPreview />;
    case "Tree": return <TreePreview />;
    case "TransferList": return <TransferListPreview />;
    case "Mentions": return <MentionsPreview />;
    case "CommandPalette": return <CommandPalettePreview />;
    case "DataTable": return <DataTablePreview />;
    case "Chart": return <ChartGalleryPreview />;
    case "Collapsible": return <CollapsiblePreview />;
    case "Asset": return <AssetPreview />;
    case "ContextMenu": return <ContextMenuPreview />;
    case "Menubar": return <MenubarPreview />;
    case "Agreement": return <AgreementPreview />;
    case "AuthProviderButton": return <AuthProviderButtonPreview />;
    case "AuthScreenLayout": return <AuthScreenLayoutPreview />;
    case "Top": return <TopPreview />;
    case "Heading": return <HeadingPreview />;
    case "ToggleGroup": return <ToggleGroupPreview />;
    case "TagsInput": return <TagsInputPreview />;
    case "Sidebar": return <SidebarPreview />;
    case "BottomInfo": return <BottomInfoPreview />;
    case "SkipNav": return <SkipNavPreview />;
    case "DateRangePicker": return <DateRangePreview />;
    case "TextFormat": return <TextFormatPreview />;
    case "Anchor": return <AnchorPreview />;
    case "Calendar": return <CalendarPreview />;
    case "FloatingActionButton": return <FloatingActionPreview />;
    case "Carousel": return <HjmCarousel label="이번 주 소식" slides={[{ id: "one", label: "좋아하는 소식만 골라요" }, { id: "two", label: "언제든 설정을 바꿀 수 있어요" }]} labels={{ previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" }} composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`} renderSlide={({ label }) => <HjmText>{label}</HjmText>} />;
    case "Steps": return <HjmSteps composeAccessibleName={stepsExample.accessibleName} descriptor={{ steps: stepsExample.steps, currentStepId: stepsExample.currentStepId }} statusLabels={stepsExample.statusLabels} />;
    case "Menu": return <ObservablePreview>{({ setMessage }) => <HjmMenu trigger={<HjmIconButton label={menuExample.triggerLabel} tone="ghost"><HjmIcon name="more" /></HjmIconButton>} label={menuExample.label} items={menuExample.items} onAction={(id) => setMessage(menuExample.result(menuExample.items.find((item) => item.id === id)?.label ?? id))} />}</ObservablePreview>;
    case "Badge": return <HjmStack axis="inline" gap="sm">{badgeExample.map((item) => <HjmBadge key={item.label} {...("tone" in item ? { tone: item.tone } : {})}>{item.label}</HjmBadge>)}</HjmStack>;
    case "Avatar": return <HjmAvatar name={avatarExample.name} />;
    case "CounterBadge": return <CounterBadgePreview />;
    case "TopBar": return <HjmTopBar title={topBarExample.title} leading={<HjmIconButton label={topBarExample.back} tone="ghost"><HjmIcon name="chevronStart" /></HjmIconButton>} actions={<HjmButton tone="ghost">{topBarExample.done}</HjmButton>} />;
    case "BottomCTA": return <ObservablePreview>{({ setMessage }) => <HjmBottomCTA description={bottomCtaExample.description} primaryAction={{ label: bottomCtaExample.primary.label, onClick: () => setMessage(bottomCtaExample.primary.result) }} secondaryAction={{ label: bottomCtaExample.secondary.label, onClick: () => setMessage(bottomCtaExample.secondary.result) }} />}</ObservablePreview>;
    case "List": return <HjmList label={listExample.label}>{listExample.items.map((item) => <HjmListRow key={item.id} title={item.title} description={item.description} leading={<HjmAvatar name={item.title} aria-hidden="true" />} leadingShape="circle" />)}</HjmList>;
    case "ListRow": return <ObservablePreview>{({ setMessage }) => <HjmListRow title={listRowExample.title} description={listRowExample.description} leading={<HjmAvatar name={listRowExample.title} aria-hidden="true" />} leadingShape="circle" trailing={<HjmIcon name="chevronEnd" />} onClick={() => setMessage(listRowExample.result)} />}</ObservablePreview>;
    case "Tag": return <HjmStack axis="inline" gap="sm" wrap>{tagExample.map((item) => <HjmTag key={item.label} {...("tone" in item ? { tone: item.tone } : {})}>{item.label}</HjmTag>)}</HjmStack>;
    case "Accordion": return <HjmAccordion aria-label={accordionExample.label} items={accordionExample.items} />;
    case "Divider": return <HjmStack gap="sm"><HjmText>{dividerExample.above}</HjmText><HjmDivider /><HjmText>{dividerExample.below}</HjmText></HjmStack>;
    case "Statistic": return <HjmStatistic descriptor={statisticExample} />;
    case "Section": return <HjmSection title={sectionExample.title} description={sectionExample.description}><HjmText>{sectionExample.body}</HjmText></HjmSection>;
    case "UploadItem": return <ObservablePreview>{({ setMessage }) => <HjmUploadItem descriptor={uploadItemExample.descriptor} labels={uploadItemExample.labels} onCancel={() => setMessage(uploadItemExample.result)} />}</ObservablePreview>;
    case "Timeline": return <HjmTimeline composeAccessibleName={timelineExample.accessibleName} items={timelineExample.items} />;
    case "DescriptionList": return <HjmDescriptionList aria-label={descriptionListExample.label} items={descriptionListExample.items} />;
    case "Image": return <HjmImage src={mountainPhoto} width={imageExample.width} height={imageExample.height} fit="cover" decorative={false} accessibilityLabel={imageExample.label} />;
    case "EmptyState": return <EmptyStateRecoveryPreview />;
    case "Notice": return <HjmNotice title={noticeExample.title} description={noticeExample.description} />;
    case "Progress": return <HjmProgress label={progressExample.label} value={progressExample.value} valueText={progressExample.valueText} />;
    case "ColorPicker": return <WebAdditionsPreview mode="color" />;
    case "Watermark": return <WebAdditionsPreview mode="watermark" />;
    case "Affix": return <WebAdditionsPreview mode="affix" />;
    case "Masonry": return <DataLayoutPreview />;
    case "VirtualList": return <DataLayoutPreview mode="virtual" />;
    case "QRCode": return <DataLayoutPreview mode="qr" />;
    case "ThinkingOrb": return <ThinkingOrb label="검색 중" state="searching" />;
    case "Spinner": return <HjmSpinner label={spinnerExample.label} />;
    case "Skeleton": return <SkeletonPreview />;
    case "Result": return <ObservablePreview>{({ setMessage }) => <HjmResult status={resultExample.status} title={resultExample.title} description={resultExample.description} actions={[{ label: resultExample.action, onAction: () => setMessage(resultExample.actionResult) }]} />}</ObservablePreview>;
    case "Toast": return <ObservablePreview>{({ message, setMessage }) => message ? <PreviewTools><PreviewToolButton onClick={() => setMessage("")}>{toastExample.showAgain}</PreviewToolButton></PreviewTools> : <HjmToast descriptor={{ id: toastExample.saved.id, tone: "success", title: toastExample.saved.title, description: toastExample.saved.description, closeLabel: toastExample.saved.closeLabel, press: { accessibilityLabel: toastExample.saved.pressLabel, onPress: () => setMessage(toastExample.saved.pressResult) } }} onDismissRequest={(reason) => { if (reason !== "press") setMessage(toastExample.dismissed); }} />}</ObservablePreview>;
    case "Dialog": return <DialogPreview />;
    // Keep the information tone beside destructive confirmation for comparison.
    case "AlertDialog": return <AlertDialogPreview />;
    case "Sheet": return <HjmSheet trigger={<HjmButton tone="secondary">{sheetExample.trigger}</HjmButton>} title={sheetExample.title} closeLabel={sheetExample.closeLabel} description={sheetExample.description} footer={<HjmButton>{sheetExample.apply}</HjmButton>}><HjmText as="p">{sheetExample.body}</HjmText></HjmSheet>;
    case "Tooltip": return <HjmStack gap="xs" align="start"><HjmTooltip trigger={<HjmIconButton label={tooltipExample.label} tone="ghost"><HjmIcon name="help" /></HjmIconButton>} content={tooltipExample.content} /><HjmText as="p" variant="label" tone="muted">{tooltipExample.hint}</HjmText></HjmStack>;
    case "VisuallyHidden": return <VisuallyHiddenPreview />;
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
  // Container는 축 이름으로 값을 묶는다(`maxWidths.content`, `gutters.regular`). 잎 경로가
  // 속성 이름으로 끝나지 않아 아래 접미사 규칙이 하나도 걸리지 않았고, Container만
  // resolvedMetric이 null로 남았다 (#21).
  if (/ratios\.[^.]+$/i.test(path)) return "aspectRatio";
  if (/maxWidths\.[^.]+$/i.test(path)) return "maxWidth";
  if (/gutters\.[^.]+$/i.test(path)) return "paddingInline";
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
      // 비율은 1 미만일 수 있다(portrait = 0.75). 길이 하한만 그대로 둔다.
      (/ratios\.[^.]+$/i.test(leaf.path) ? leaf.value > 0 : leaf.value >= 1) &&
      leaf.value <= (/(?:min|max)?width/i.test(leaf.path) ? 1280 : 160) &&
      /(?:minHeight|height|diameter|paddingHorizontal|paddingVertical|gap|size|thickness|width|insetStart|insetEnd|(?:gaps|sizes|radii|maxWidths|gutters|ratios)\.[^.]+)$/i.test(leaf.path),
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
    // Evidence metadata must not paint the enclosing preview: a recipe's first
    // color can be a separator or inverse label (Splitter became unreadable).
    // The real renderer owns recipe paint; ordinary content inherits the provider.
  }
  if (metric && typeof metric.value === "number") {
    style["--hjm-evidence-metric"] = metricProperty === "aspectRatio"
      ? String(metric.value)
      : `${metric.value}px`;
    const appliedMetric = metricProperty === "minHeight"
      ? Math.min(metric.value, 96)
      : metric.value;
    // Inset/padding metrics stay evidence-only (--hjm-evidence-metric): applied to the wrapper they shifted the real
    // renderer, e.g. List's indented-separator inset (52) pushed every row 52px inward (2026-10-17 review E5).
    if (metricProperty === "aspectRatio") style.aspectRatio = appliedMetric;
    else if (metricProperty === "paddingInlineStart" || metricProperty === "paddingInlineEnd" || metricProperty === "paddingInline" || metricProperty === "paddingBlock") { /* evidence-only */ }
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
  if (!component || getComponentSurfaceStatus(component, "web") === "planned") {
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
      owner: "@hjmds/design-contracts",
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
    // Stable since 1.5.0 (docs/stable-core.md); the adapter evidence stays required.
    contract.status !== "stable" ||
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
      owner: "@hjmds/design-contracts",
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
  Container: createWebRendererDefinition("Container", "containerRecipe"),
  AspectRatio: createWebRendererDefinition("AspectRatio", "aspectRatioRecipe"),
  Grid: createWebRendererDefinition("Grid", "gridRecipe"),
  Layout: createWebRendererDefinition("Layout", "layoutRecipe", "layout"),
  Button: createWebRendererDefinition("Button", "buttonRecipe"),
  IconButton: createWebRendererDefinition("IconButton", "iconButtonRecipe"),
  Link: createWebRendererDefinition("Link", "linkRecipe", "link"),
  Field: createWebRendererDefinition("Field", "fieldRecipe", "field"),
  SearchField: createWebRendererDefinition("SearchField", "searchFieldRecipe", "searchField"),
  TextArea: createWebRendererDefinition("TextArea", "fieldRecipe"),
  PasswordField: createWebRendererDefinition("PasswordField", "passwordFieldRecipe", "passwordField"),
  OtpField: createWebRendererDefinition("OtpField", "otpFieldRecipe", "otpField"),
  ImageChoiceGroup: createWebRendererDefinition("ImageChoiceGroup", "imageChoiceRecipe"),
  NumberField: createWebRendererDefinition("NumberField", "numberFieldRecipe", "numberField"),
  Slider: createWebRendererDefinition("Slider", "sliderRecipe", "slider"),
  Form: createWebRendererDefinition("Form", "formRecipe", "form"),
  DatePicker: createWebRendererDefinition("DatePicker", "datePickerRecipe", "datePicker"),
  FilePicker: createWebRendererDefinition("FilePicker", "filePickerRecipe", "filePicker"),
  Checkbox: createWebRendererDefinition("Checkbox", "selectionControlRecipe", "checkbox"),
  Radio: createWebRendererDefinition("Radio", "selectionControlRecipe"),
  CheckboxGroup: createWebRendererDefinition("CheckboxGroup", "selectionGroupRecipe", "checkboxGroup"),
  RadioGroup: createWebRendererDefinition("RadioGroup", "selectionGroupRecipe", "radioGroup"),
  Switch: createWebRendererDefinition("Switch", "switchRecipe", "switch"),
  SegmentedControl: createWebRendererDefinition("SegmentedControl", "segmentedControlRecipe", "segmentedControl"),
  Chip: createWebRendererDefinition("Chip", "chipRecipe", "chip"),
  Select: createWebRendererDefinition("Select", "selectRecipe", "select"),
  Combobox: createWebRendererDefinition("Combobox", "comboboxRecipe", "combobox"),
  Tabs: createWebRendererDefinition("Tabs", "tabsRecipe", "tabs"),
  BottomNavigation: createWebRendererDefinition("BottomNavigation", "bottomNavigationRecipe", "bottomNavigation"),
  LoadMore: createWebRendererDefinition("LoadMore", "loadMoreRecipe", "loadMore"),
  Breadcrumb: createWebRendererDefinition("Breadcrumb", "breadcrumbRecipe", "breadcrumb"),
  Pagination: createWebRendererDefinition("Pagination", "paginationRecipe", "pagination"),
  Popover: createWebRendererDefinition("Popover", "popoverRecipe", "popover"),
  SidePanel: createWebRendererDefinition("SidePanel", "sidePanelRecipe", "sidePanel"),
  Splitter: createWebRendererDefinition("Splitter", "splitterRecipe", "splitter"),
  Tour: createWebRendererDefinition("Tour", "tourRecipe", "tour"),
  Tree: createWebRendererDefinition("Tree", "treeRecipe", "tree"),
  TransferList: createWebRendererDefinition("TransferList", "transferListRecipe", "transferList"),
  Mentions: createWebRendererDefinition("Mentions", "comboboxRecipe", "combobox"),
  CommandPalette: createWebRendererDefinition("CommandPalette", "commandPaletteRecipe", "commandPalette"),
  DataTable: createWebRendererDefinition("DataTable", "dataTableRecipe", "dataTable"),
  Chart: createWebRendererDefinition("Chart", "chartRecipe", "chart"),
  Agreement: createWebRendererDefinition("Agreement", "agreementRecipe", "agreement"),
  AuthProviderButton: createWebRendererDefinition("AuthProviderButton", "authProviderButtonRecipe", "authProviderButton"),
  AuthScreenLayout: createWebRendererDefinition("AuthScreenLayout", "authScreenRecipe", "authScreen"),
  Top: createWebRendererDefinition("Top", "topRecipe", "top"),
  Heading: createWebRendererDefinition("Heading", "headingRecipe", "heading"),
  ToggleGroup: createWebRendererDefinition("ToggleGroup", "toggleGroupRecipe", "toggleGroup"),
  TagsInput: createWebRendererDefinition("TagsInput", "tagsInputRecipe", "tagsInput"),
  Sidebar: createWebRendererDefinition("Sidebar", "sidebarRecipe", "sidebar"),
  BottomInfo: createWebRendererDefinition("BottomInfo", "bottomInfoRecipe", "bottomInfo"),
  SkipNav: createWebRendererDefinition("SkipNav", "skipNavRecipe", "skipNav"),
  DateRangePicker: createWebRendererDefinition("DateRangePicker", "calendarRecipe", "dateRange"),
  TextFormat: createWebRendererDefinition("TextFormat", "textFormatRecipe", "textFormat"),
  Anchor: createWebRendererDefinition("Anchor", "anchorRecipe", "anchor"),
  Calendar: createWebRendererDefinition("Calendar", "calendarRecipe", "calendar"),
  FloatingActionButton: createWebRendererDefinition("FloatingActionButton", "floatingActionButtonRecipe", "floatingActionButton"),
  Carousel: createWebRendererDefinition("Carousel", "carouselRecipe", "carousel"),
  Steps: createWebRendererDefinition("Steps", "stepsRecipe"),
  Menu: createWebRendererDefinition("Menu", "menuRecipe", "menu"),
  // ContextMenu는 항목 어휘가 Menu와 같아 recipe도 menuRecipe를 그대로 쓴다.
  ContextMenu: createWebRendererDefinition("ContextMenu", "menuRecipe", "contextMenu"),
  Menubar: createWebRendererDefinition("Menubar", "menubarRecipe", "menubar"),
  Badge: createWebRendererDefinition("Badge", "badgeRecipe"),
  Avatar: createWebRendererDefinition("Avatar", "avatarRecipe"),
  CounterBadge: createWebRendererDefinition("CounterBadge", "counterBadgeRecipe"),
  Card: createWebRendererDefinition("Card", "cardRecipe"),
  List: createWebRendererDefinition("List", "listRecipe"),
  ListRow: createWebRendererDefinition("ListRow", "listRowRecipe"),
  TopBar: createWebRendererDefinition("TopBar", "topBarRecipe"),
  BottomCTA: createWebRendererDefinition("BottomCTA", "bottomCtaRecipe"),
  Tag: createWebRendererDefinition("Tag", "tagRecipe"),
  Accordion: createWebRendererDefinition("Accordion", "accordionRecipe", "disclosureGroup"),
  Collapsible: createWebRendererDefinition("Collapsible", "collapsibleRecipe", "collapsible"),
  Asset: createWebRendererDefinition("Asset", "assetRecipe", "asset"),
  Divider: createWebRendererDefinition("Divider", "dividerRecipe"),
  Statistic: createWebRendererDefinition("Statistic", "statisticRecipe"),
  Section: createWebRendererDefinition("Section", "sectionRecipe"),
  UploadItem: createWebRendererDefinition("UploadItem", "uploadItemRecipe", "uploadItem"),
  Timeline: createWebRendererDefinition("Timeline", "timelineRecipe"),
  DescriptionList: createWebRendererDefinition("DescriptionList", "descriptionListRecipe"),
  Image: createWebRendererDefinition("Image", "imageRecipe"),
  EmptyState: createWebRendererDefinition("EmptyState", "emptyStateRecipe"),
  Notice: createWebRendererDefinition("Notice", "noticeRecipe"),
  Progress: createWebRendererDefinition("Progress", "progressRecipe"),
  ColorPicker: createWebRendererDefinition("ColorPicker", "colorPickerRecipe"),
  Watermark: createWebRendererDefinition("Watermark", "watermarkRecipe"),
  Affix: createWebRendererDefinition("Affix", "affixRecipe"),
  Masonry: createWebRendererDefinition("Masonry", "masonryRecipe"),
  VirtualList: createWebRendererDefinition("VirtualList", "virtualListRecipe"),
  QRCode: createWebRendererDefinition("QRCode", "qrCodeRecipe"),
  ThinkingOrb: createWebRendererDefinition("ThinkingOrb", "thinkingOrbRecipe"),
  Spinner: createWebRendererDefinition("Spinner", "spinnerRecipe"),
  Skeleton: createWebRendererDefinition("Skeleton", "skeletonRecipe"),
  Result: createWebRendererDefinition("Result", "resultRecipe"),
  Toast: createWebRendererDefinition("Toast", "toastRecipe", "toast"),
  Dialog: createWebRendererDefinition("Dialog", "dialogRecipe", "dialog"),
  AlertDialog: createWebRendererDefinition("AlertDialog", "alertDialogRecipe", "alertDialog"),
  Sheet: createWebRendererDefinition("Sheet", "sheetRecipe", "sheet"),
  Tooltip: createWebRendererDefinition("Tooltip", "tooltipRecipe", "tooltip"),
  VisuallyHidden: createWebRendererDefinition("VisuallyHidden", "visuallyHiddenRecipe"),
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

function StatusBadge({ surface, status }: { surface: string; status: ComponentSurfaceStatus }) {
  return <HjmBadge tone={statusTones[status]} variant={status === "unsupported" ? "outline" : "filled"}>{surface}: {statusLabels[status]}</HjmBadge>;
}

function StoryHeader({ entry }: { entry: ShowcaseComponentEntry }) {
  const { component } = entry;
  const { roadmap } = component;
  return (
    <>
      <p className="hjm-eyebrow">{categoryLabels[component.category]} · {platformLabels[component.platform]}</p>
      <h1 className="hjm-title">{storyLabels[component.name] ?? component.name}</h1>
      {/* The code name stays visible and searchable under the Korean title. */}
      <HjmText as="p" variant="label" tone="muted"><code>{component.name}</code></HjmText>
      <HjmStack className="hjm-meta-row" axis="inline" gap="xs" wrap>
        <StatusBadge surface={surfaceLabels.contract} status={component.status} />
        <StatusBadge surface={surfaceLabels.web} status={entry.surfaceMaturity.web} />
        <StatusBadge surface={surfaceLabels.native} status={entry.surfaceMaturity.native} />
        {component.behavior && <HjmBadge variant="outline">동작 규칙 <code>{component.behavior}</code></HjmBadge>}
        {component.recipe && <HjmBadge variant="outline">레시피 <code>{component.recipe}</code></HjmBadge>}
      </HjmStack>
      {roadmap && (
        <HjmSurface as="section" className="hjm-roadmap-callout" bordered padding="md" data-roadmap={roadmap.state} aria-label="로드맵">
          <HjmStack gap="xs" align="start">
            <HjmBadge tone={roadmapStateTones[roadmap.state]}>{roadmapStateLabels[roadmap.state]}</HjmBadge>
            <HjmText as="p">{roadmap.summary}</HjmText>
            {roadmap.targets && <HjmText as="p" variant="label" tone="muted">함께 쓰는 컴포넌트: {roadmap.targets.join(" + ")}</HjmText>}
          </HjmStack>
        </HjmSurface>
      )}
    </>
  );
}

function EvidenceSection({ entry, contract }: { entry: ShowcaseComponentEntry; contract: ReactNode }) {
  return (
    <section className="hjm-showcase-section" aria-labelledby={`${entry.component.name}-evidence`}>
      <h2 className="hjm-section-title" id={`${entry.component.name}-evidence`}>확인해야 할 증거</h2>
      <div className="hjm-showcase-grid"><article className="hjm-showcase-card"><h3>지원 표면</h3><p>{entry.requiredSurfaces.map((surface) => surfaceLabels[surface]).join(" · ")}</p></article><article className="hjm-showcase-card"><h3>필수 시나리오</h3><ul className="hjm-requirement-list">{entry.requiredScenarios.map((id) => <li key={id}>{scenarioLabels.get(id)}</li>)}</ul></article><article className="hjm-showcase-card"><h3>계약</h3><p>{contract}</p></article></div>
    </section>
  );
}

function RecipeContract({ name, recipe }: { name?: string; recipe: object }) {
  return <>{name ? <>레시피 <code>{name}</code> · </> : null}분기 {Object.keys(recipe).map((key, index) => <span key={key}>{index > 0 ? " · " : null}<code>{key}</code></span>)}</>;
}

export function ContractOnlyStory({ entry }: { entry: ShowcaseComponentEntry }) {
  const recipe = entry.component.recipe ? recipeRegistry[entry.component.recipe] : null;
  const contract = recipe ? <RecipeContract recipe={recipe} /> : "동작·API 또는 범위 결정만 있습니다.";
  return (
    <main className="hjm-page" data-showcase-mode="contract-only">
      <StoryHeader entry={entry} />
      <section className="hjm-showcase-section" aria-labelledby={`${entry.component.name}-contract`}><h2 className="hjm-section-title" id={`${entry.component.name}-contract`}>계약만 등록</h2><div className="hjm-stage"><div className="hjm-roadmap-preview"><HjmBadge variant="outline">렌더러 증거 없음</HjmBadge><strong>{entry.component.name}</strong><p>이 페이지는 범위와 승격 조건만 기록합니다. 구현된 웹 화면을 의미하지 않습니다.</p></div></div></section>
      <EvidenceSection entry={entry} contract={contract} />
    </main>
  );
}

export function UnsupportedWebStory({ entry }: { entry: ShowcaseComponentEntry }) {
  return (
    <main className="hjm-page" data-showcase-mode="web-unsupported">
      <StoryHeader entry={entry} />
      <section className="hjm-showcase-section" aria-labelledby={`${entry.component.name}-unsupported`}><h2 className="hjm-section-title" id={`${entry.component.name}-unsupported`}>웹 렌더러 미지원</h2><div className="hjm-stage"><div className="hjm-roadmap-preview"><HjmBadge variant="outline">앱 화면</HjmBadge><strong>{entry.component.name}</strong><p>이 계약은 앱 렌더러에서 검증합니다. Showcase가 비슷한 웹 화면을 만들어 지원 범위를 과장하지 않습니다.</p></div></div></section>
      <EvidenceSection entry={entry} contract="앱 렌더러 계약입니다. 웹 구현은 등록되지 않았습니다." />
    </main>
  );
}

function InteractiveWebStory({ entry, name }: { entry: ShowcaseComponentEntry; name: WebRendererComponentName }) {
  const definition = webRendererRegistry[name];
  const contract = definition.recipe
    ? <RecipeContract name={definition.recipe.name} recipe={definition.recipe.value} />
    : "웹 어댑터가 등록된 제공자·API 계약입니다.";
  return (
    <main className="hjm-page" data-showcase-mode="web-renderer">
      <StoryHeader entry={entry} />
      <section className="hjm-showcase-section" aria-labelledby={`${name}-preview`}><h2 className="hjm-section-title" id={`${name}-preview`}>웹 예제</h2><div className="hjm-stage" data-inline-overlay={name === "DatePicker" ? "true" : undefined}><ComponentPreview name={name} /></div></section>
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


function FloatingActionPreview() {
  const [clearance, setClearance] = useState(0);
  // A transformed preview owns the fixed-position containing block, so the
  // sample cannot cover unrelated Catalog entries or the Showcase navigation.
  return <div style={{ position: "relative", transform: "translateZ(0)", paddingBottom: clearance }}>
    <HjmText>{floatingActionExample.body}</HjmText>
    <HjmFloatingActionButton descriptor={{ label: floatingActionExample.label, icon: { name: "add" } }} renderIcon={() => <HjmIcon name="add" />}
      onContentClearanceChange={setClearance} />
  </div>;
}

// BottomNavigation is position: fixed. A transformed, phone-width stage owns its containing block so the bar sits at the
// bottom of the example instead of covering the evidence cards at the bottom of the Storybook viewport (2026-10-17 D8).
function BottomNavigationPreview() {
  const [selected, setSelected] = useState<string>(bottomNavigationExample.initial);
  return <div style={{ position: "relative", transform: "translateZ(0)", blockSize: 240, inlineSize: "100%", maxInlineSize: 402, marginInline: "auto", overflow: "hidden", border: "1px solid var(--hjm-color-border)", borderRadius: "var(--hjm-radius-lg)" }}>
    <HjmBottomNavigation descriptor={{ accessibilityLabel: bottomNavigationExample.label, selectedKey: selected, items: bottomNavigationExample.items }}
      getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)} renderIcon={({ name }) => <HjmIcon name={name} />} />
  </div>;
}

// The count overlays the bell's top-end corner (floating, the NotificationBell placement) and sits inline at a row's end;
// a separate inline badge beside the bell did not read as the bell's count (2026-10-17 review E7).
function CounterBadgePreview() {
  return <HjmStack gap="md" align="start">
    <span style={{ position: "relative", display: "inline-flex" }}>
      <HjmIconButton label={counterBadgeExample.bellLabel}><HjmIcon name="notifications" /></HjmIconButton>
      <span style={{ position: "absolute", top: 0, insetInlineEnd: 0, pointerEvents: "none" }}><HjmCounterBadge count={counterBadgeExample.count} variant="floating" /></span>
    </span>
    <HjmListRow title={counterBadgeExample.inbox} trailing={<HjmCounterBadge count={counterBadgeExample.inboxValue} accessibilityLabel={counterBadgeExample.inboxCount} />} />
  </HjmStack>;
}

// Loaded rows are appended to a real list; LoadMore's own busy/complete footer reports progress (2026-10-17 D14).
function LoadMorePreview() {
  const [pages, setPages] = useState(1);
  const complete = pages >= loadMoreExample.totalPages;
  return <HjmStack gap="md">
    <HjmList label={loadMoreExample.listLabel}>{Array.from({ length: pages * loadMoreExample.pageSize }, (_, index) => <HjmListRow key={index} title={loadMoreExample.item(index + 1)} />)}</HjmList>
    <HjmLoadMore mode="manual" descriptor={{ state: complete ? { status: "complete" } : { status: "ready", requestKey: `page-${pages}` }, labels: loadMoreExample.labels }} onLoadMore={async () => { setPages((value) => value + 1); }} />
  </HjmStack>;
}

// A rendered control is not action evidence when its callback is a no-op.
// Local observable state keeps these package examples independent of a backend.
function ObservablePreview({ children }: { children: (state: {
  message: string; setMessage: (value: string) => void;
  selected: boolean; setSelected: (value: boolean) => void;
}) => ReactNode }) {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(true);
  return <HjmStack gap="sm">{children({ message, setMessage, selected, setSelected })}
    {message ? <HjmText role="status">{message}</HjmText> : null}
  </HjmStack>;
}

function DatePickerPreview() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Display formatting is product-owned; keeping null after selection made the
  // demo appear to discard a date even though Calendar selection had changed.
  return <HjmDatePicker clearLabel={datePickerExample.clearLabel} closeLabel={datePickerExample.closeLabel}
    composeAccessibleName={datePickerExample.accessibleName}
    descriptor={{ grid: previewCalendarGrid, displayValue: selectedDate, placeholder: datePickerExample.placeholder, label: datePickerExample.label, selectedDate, onSelectionChange: setSelectedDate }} monthLabel={datePickerExample.monthLabel} />;
}

// Two independent filter chips (multiple selection), as Native; the old pair coupled a single and a multiple chip.
function ChipPreview() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(chipExample.initial));
  return <HjmStack axis="inline" gap="sm" wrap role="group" aria-label={chipExample.label}>{chipExample.items.map((item) => <HjmChip key={item.id} label={item.label} selectionMode="multiple" selected={selected.has(item.id)}
    onSelectedChange={(next) => setSelected((current) => { const updated = new Set(current); if (next) updated.add(item.id); else updated.delete(item.id); return updated; })} />)}</HjmStack>;
}

// The icon button's accessible name stays "알림"; the visually hidden count is its description, so a screen reader
// hears both while the screen shows only the HJM icon button (the old raw <button> with an emoji, review F16).
function VisuallyHiddenPreview() {
  return <HjmStack axis="inline" gap="md" align="center" wrap>
    <HjmIconButton label={visuallyHiddenExample.button} aria-describedby="visually-hidden-preview-context"><HjmIcon name="notifications" /></HjmIconButton>
    <HjmVisuallyHidden id="visually-hidden-preview-context">{visuallyHiddenExample.context}</HjmVisuallyHidden>
    <HjmText tone="muted">{visuallyHiddenExample.hint}</HjmText>
  </HjmStack>;
}

// SkipNav is off-screen until focused; the frame is its positioned, clipping container so the focused link pins to
// this example instead of the Storybook page (review F15: the story rendered the Sidebar demo instead).
function SkipNavPreview() {
  const link = useRef<HTMLAnchorElement>(null);
  return <HjmStack gap="md">
    <div style={{ position: "relative", overflow: "hidden", border: "var(--hjm-stroke-default) solid var(--hjm-color-border)", borderRadius: "var(--hjm-radius-lg)" }}>
      <HjmSkipNav ref={link} targetId="skip-nav-preview-main" label={skipNavExample.label} />
      <HjmStack gap="lg" style={{ padding: "var(--hjm-space-lg)" }}>
        <header><HjmStack axis="inline" gap="lg" align="center" wrap>
          <HjmText emphasis="strong">{skipNavExample.app}</HjmText>
          <nav aria-label={skipNavExample.menuLabel}><HjmStack axis="inline" gap="md" wrap>{skipNavExample.menu.map(item => <HjmLink key={item.id} href={`#skip-nav-preview-${item.id}`}>{item.label}</HjmLink>)}</HjmStack></nav>
        </HjmStack></header>
        <section id="skip-nav-preview-main" aria-label={skipNavExample.mainLabel}><HjmStack gap="xs">
          <HjmText variant="title">{skipNavExample.mainTitle}</HjmText>
          <HjmText>{skipNavExample.mainBody}</HjmText>
        </HjmStack></section>
      </HjmStack>
    </div>
    <HjmText tone="muted" variant="caption">{skipNavExample.hint}</HjmText>
    <PreviewTools><PreviewToolButton onClick={() => link.current?.focus()}>{skipNavExample.focusTool}</PreviewToolButton></PreviewTools>
  </HjmStack>;
}
