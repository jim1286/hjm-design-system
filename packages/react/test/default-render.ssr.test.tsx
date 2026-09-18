import { Popover } from "../src/popover.js";
import { SidePanel } from "../src/side-panel.js";
import { Splitter } from "../src/splitter.js";
import { Tour } from "../src/tour.js";
import { Tree } from "../src/tree.js";
import { TransferList } from "../src/transfer-list.js";
import { Mentions } from "../src/mentions.js";
import { CommandPalette } from "../src/command-palette.js";
import { Agreement } from "../src/agreement.js";
import { Top } from "../src/top.js";
import { Heading } from "../src/heading.js";
import { TextFormat } from "../src/text-formats.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { TagsInput } from "../src/tags-input.js";
import { SkipNav } from "../src/skip-nav.js";
import { BottomInfo } from "../src/bottom-info.js";
import { Sidebar } from "../src/sidebar.js";
import { DateRangePicker } from "../src/date-range.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { DataTable } from "../src/data-table.js";
import { Collapsible } from "../src/collapsible.js";
import { ContextMenu } from "../src/context-menu.js";
import { Menubar } from "../src/menubar.js";
import { Asset } from "../src/asset.js";
import { Breadcrumb } from "../src/breadcrumb.js";
import { Pagination } from "../src/pagination.js";
import { Anchor } from "../src/anchor.js";
import { FloatingActionButton } from "../src/floating-action-button.js";
import { Carousel } from "../src/carousel.js";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  BottomNavigation,
  BottomCTA,
  TopBar,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  Container,
  CounterBadge,
  DescriptionList,
  DatePicker,
  Calendar,
  Dialog,
  Divider,
  EmptyState,
  Field,
  FilePicker,
  Form,
  Grid,
  HjmProvider,
  Icon,
  IconButton,
  Image,
  Layout,
  Link,
  List,
  ListRow,
  LoadMore,
  Menu,
  Notice,
  NumberField,
  OtpField,
  PasswordField,
  Progress,
  Radio,
  RadioGroup,
  Result,
  SearchField,
  SegmentedControl,
  Section,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Steps,
  Surface,
  Switch,
  Tabs,
  Tag,
  Text,
  TextArea,
  TextField,
  Timeline,
  Toast,
  Tooltip,
  Statistic,
  UploadItem,
  VisuallyHidden,
} from "../src/index.js";
import { reactRendererEvidence } from "../src/evidence.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

type DefaultRenderFixture = Readonly<{
  componentId: string;
  marker: string;
  render(): ReactNode;
}>;

const readyLoadMoreDescriptor = {
  state: { status: "ready", requestKey: "default-page" },
  labels: {
    loadMore: "더 보기",
    loading: "불러오는 중",
    retry: "다시 시도",
    complete: "모두 불러옴",
  },
} as const;

const defaultCalendarGrid = {
  cells: [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 4 }, () => ({})),
  ],
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  todayDate: "2027-02-19",
} as const;

const rendererEnvironments = executedScenarioRegistry.executions[0]!.scenarios as readonly Readonly<{
  id: "default" | "dark" | "long-copy" | "large-text" | "rtl" | "reduced-motion" | "accessibility";
  theme: "light" | "dark";
  direction: "ltr" | "rtl";
  textScale: number;
  reducedMotion: boolean;
}>[];

const longCopy = "아주 긴 제품 설명과 unexpectedly long English content must wrap without hiding the component meaning or required action.";

/**
 * Canonical default-render proofs. The component ids are stable case ids used
 * by reactRendererEvidence, while markers prevent an import-only smoke test
 * from satisfying a renderer claim.
 */
const defaultRenderFixtures: readonly DefaultRenderFixture[] = [
  { componentId: "top-bar", marker: "hjm-top-bar", render: () => <TopBar title="오늘의 할 일" /> },
  { componentId: "bottom-cta", marker: "hjm-bottom-cta", render: () => <BottomCTA primaryAction={{ label: "계속", onClick: () => {} }} /> },
  {
    componentId: "design-system-provider",
    marker: "data-hjm-provider",
    render: () => <HjmProvider systemTheme="light">Provider</HjmProvider>,
  },
  {
    componentId: "text",
    marker: "hjm-text",
    render: () => <Text>Text</Text>,
  },
  {
    componentId: "surface",
    marker: "hjm-surface",
    render: () => <Surface>Surface</Surface>,
  },
  {
    componentId: "icon",
    marker: "hjm-icon",
    render: () => <Icon name="info" />,
  },
  {
    componentId: "stack",
    marker: "hjm-stack",
    render: () => <Stack>Stack</Stack>,
  },
  {
    componentId: "container",
    marker: "hjm-container",
    render: () => <Container size="reading">Readable content</Container>,
  },
  {
    componentId: "aspect-ratio",
    marker: "hjm-aspect-ratio",
    render: () => <AspectRatio ratio="wide"><div>Media</div></AspectRatio>,
  },
  {
    componentId: "grid",
    marker: "hjm-grid",
    render: () => (
      <Grid columns={{ compact: 1, medium: 2 }}>
        <span>First</span>
        <span>Second</span>
      </Grid>
    ),
  },
  {
    componentId: "layout",
    marker: "hjm-layout",
    render: () => <Layout>Primary content</Layout>,
  },
  {
    componentId: "button",
    marker: "hjm-button",
    render: () => <Button>Button</Button>,
  },
  {
    componentId: "icon-button",
    marker: "hjm-icon-button",
    render: () => <IconButton label="메뉴">☰</IconButton>,
  },
  {
    componentId: "link",
    marker: "hjm-link",
    render: () => <Link href="/docs">Docs</Link>,
  },
  {
    componentId: "field",
    marker: "hjm-field",
    render: () => (
      <>
        <Field controlId="default-field" label="Field">
          {(controlProps) => <input {...controlProps} />}
        </Field>
        <TextField label="Text field" />
      </>
    ),
  },
  {
    componentId: "search-field",
    marker: "type=\"search\"",
    render: () => <SearchField clearLabel="Clear search" label="Search" />,
  },
  {
    componentId: "text-area",
    marker: "textarea",
    render: () => <TextArea label="Notes" />,
  },
  {
    componentId: "password-field",
    marker: "hjm-password-field",
    render: () => (
      <PasswordField
        autofillHint="current"
        concealLabel="Hide password"
        label="Password"
        revealLabel="Show password"
      />
    ),
  },
  {
    componentId: "otp-field",
    marker: "hjm-otp-field__slots",
    render: () => <OtpField label="Verification code" length={6} />,
  },
  {
    componentId: "number-field",
    marker: "hjm-number-field",
    render: () => (
      <NumberField
        decrementLabel="Decrease"
        incrementLabel="Increase"
        label="Quantity"
        min={0}
        max={10}
      />
    ),
  },
  {
    componentId: "slider",
    marker: "hjm-slider",
    render: () => <Slider label="Score" min={0} max={10} />,
  },
  {
    componentId: "form",
    marker: "hjm-form",
    render: () => <Form onSubmit={() => undefined}><TextField label="Name" /></Form>,
  },
  {
    componentId: "date-picker",
    marker: "hjm-date-picker",
    render: () => (
      <DatePicker
        clearLabel="Clear date"
        closeLabel="Close calendar"
        composeAccessibleName={({ date }) => date}
        descriptor={{
          grid: defaultCalendarGrid,
          displayValue: null,
          placeholder: "Choose a date",
          label: "Date",
          selectedDate: null,
          onSelectionChange: () => undefined,
          open: false,
          onOpenChange: () => undefined,
        }}
        monthLabel="February 2027"
      />
    ),
  },
  {
    componentId: "calendar",
    marker: "hjm-calendar",
    render: () => <Calendar descriptor={{ grid: defaultCalendarGrid, monthLabel: "February 2027" }} composeAccessibleName={({ date }) => date} />,
  },
  {
    componentId: "file-picker",
    marker: "hjm-file-picker",
    render: () => (
      <FilePicker
        buttonLabel="Choose files"
        descriptor={{ mode: "multiple", accept: ["image/*"] }}
        dropzoneLabel="Drop files here"
        label="Attachments"
        onSelect={() => undefined}
      />
    ),
  },
  {
    componentId: "checkbox",
    marker: "type=\"checkbox\"",
    render: () => <Checkbox label="Checkbox" />,
  },
  {
    componentId: "radio",
    marker: "type=\"radio\"",
    render: () => <Radio label="Radio" name="default-radio" />,
  },
  {
    componentId: "checkbox-group",
    marker: "hjm-checkbox-group",
    render: () => (
      <CheckboxGroup label="Checkbox group" items={[{ id: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "radio-group",
    marker: "hjm-radio-group",
    render: () => (
      <RadioGroup label="Radio group" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "switch",
    marker: "role=\"switch\"",
    render: () => <Switch label="Switch" />,
  },
  {
    componentId: "segmented-control",
    marker: "hjm-segmented",
    render: () => (
      <SegmentedControl label="Segmented" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "chip",
    marker: "hjm-chip",
    render: () => <Chip label="Filter" />,
  },
  {
    componentId: "tabs",
    marker: "role=\"tablist\"",
    render: () => (
      <Tabs label="Tabs" items={[{ id: "one", label: "One", panel: "Panel" }]} />
    ),
  },
  { componentId: "breadcrumb", marker: "hjm-breadcrumb", render: () => <Breadcrumb label="현재 위치" items={[{ id: "all", label: "전체", destination: { kind: "internal", href: "#all" } }, { id: "current", label: "일상" }]} /> },
  { componentId: "pagination", marker: "hjm-pagination", render: () => <Pagination label="페이지" descriptor={{ currentPage: 2, totalPages: 8 }} labels={{ previous: "이전", next: "다음" }} composeAccessibleName={({ page, totalPages }) => `${totalPages}페이지 중 ${page}페이지`} onPageChange={() => {}} /> },
  { componentId: "popover", marker: "hjm-popover", render: () => <Popover defaultOpen title="필터" closeLabel="닫기" trigger={<button>필터</button>}><input aria-label="제목" /></Popover> },
  {
    componentId: "side-panel",
    // Like Dialog and Sheet, the panel itself lives in a client portal; the
    // server-rendered surface is the trigger that owns it.
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <SidePanel closeLabel="Close" trigger={<button type="button">Open panel</button>} title="Details" />
    ),
  },
  {
    componentId: "splitter",
    marker: "hjm-splitter",
    render: () => (
      <Splitter label="패널 크기 조절" min={20} max={80} step={5} defaultValue={40}
        getValueText={(value) => `${value}%`}
        primaryPane={<p>목록</p>} secondaryPane={<p>상세</p>} />
    ),
  },
  {
    componentId: "tour",
    // The card lives in a client portal like the modal overlays; the trigger is
    // what the server renders.
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <Tour
        trigger={<button type="button">Start tour</button>}
        descriptor={{
          accessibilityLabel: "Product tour",
          currentStepId: "one",
          labels: { next: "Next", previous: "Previous", skip: "Skip", done: "Done" },
          steps: [{ id: "one", anchorId: "records", title: "Records", description: "Your notes live here." }],
        }}
        resolveAnchor={() => null}
        composeAnnouncement={({ position, total, title }) => `${position}/${total} ${title}`}
        onStepChange={() => {}}
      />
    ),
  },
  {
    componentId: "tree",
    marker: "hjm-tree",
    render: () => (
      <Tree
        label="폴더"
        nodes={[{ id: "root", label: "기록", textValue: "기록", children: [{ id: "leaf", label: "오늘", textValue: "오늘" }] }]}
        defaultExpandedKeys={new Set(["root"])}
        composeAccessibleName={({ depth, position, siblingCount, label: name }) => `${depth}단계 ${siblingCount}개 중 ${position}번째, ${name}`}
      />
    ),
  },
  {
    componentId: "transfer-list",
    marker: "hjm-transfer-list",
    render: () => (
      <TransferList
        items={[{ id: "a", label: "기록 A", textValue: "기록 A" }, { id: "b", label: "기록 B", textValue: "기록 B" }]}
        defaultTargetKeys={new Set(["b"])}
        labels={{ source: "전체", target: "선택", toTarget: "담기", toSource: "빼기", selectAll: "모두 선택", empty: "비어 있어요" }}
      />
    ),
  },
  {
    componentId: "mentions",
    marker: "hjm-mentions",
    render: () => (
      <Mentions
        label="함께한 사람"
        value=""
        onValueChange={() => {}}
        triggers={[{ id: "person", trigger: "@" }]}
        candidates={[]}
        emptyMessage="찾는 사람이 없어요"
        listLabel="사람 후보"
      />
    ),
  },
  {
    componentId: "command-palette",
    // Modal surface in a client portal; the trigger is the server-rendered part.
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <CommandPalette
        trigger={<button type="button">명령 열기</button>}
        descriptor={{ accessibilityLabel: "명령 팔레트", searchPlaceholder: "무엇을 할까요" }}
        source={{ items: [{ id: "write", label: "새 기록", textValue: "새 기록" }] }}
        query=""
        onQueryChange={() => {}}
        onActivate={() => {}}
      />
    ),
  },
  {
    componentId: "agreement",
    marker: "hjm-agreement",
    render: () => (
      <Agreement
        requiredLabel="(필수)"
        optionalLabel="(선택)"
        descriptor={{
          accessibilityLabel: "약관 동의",
          allLabel: "전체 동의하기",
          items: [{ id: "terms", label: "이용약관", required: true, detail: { label: "전문 보기", href: "#terms" } }],
        }}
      />
    ),
  },
  {
    componentId: "top",
    marker: "hjm-top",
    render: () => <Top descriptor={{ title: "오늘 기록을 남겨요", description: "짧아도 괜찮아요" }} />,
  },
  {
    componentId: "heading",
    marker: "hjm-heading",
    render: () => <Heading level="level2">기록 모아보기</Heading>,
  },
  {
    componentId: "text-format",
    marker: "hjm-text-format",
    render: () => <TextFormat kind="kbd">Enter</TextFormat>,
  },
  {
    componentId: "toggle-group",
    marker: "hjm-toggle-group",
    render: () => (
      <ToggleGroup descriptor={{ accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: "굵게" }] }} />
    ),
  },
  {
    componentId: "tags-input",
    marker: "hjm-tags-input",
    render: () => (
      <TagsInput label="태그" defaultTags={["산책"]} composeRemoveLabel={(tag) => `${tag} 지우기`} />
    ),
  },
  {
    componentId: "skip-nav",
    marker: "hjm-skip-nav",
    render: () => <SkipNav targetId="main" label="본문 바로가기" />,
  },
  {
    componentId: "bottom-info",
    marker: "hjm-bottom-info",
    render: () => <BottomInfo items={["가입하면 약관에 동의하는 것으로 봅니다"]} />,
  },
  {
    componentId: "sidebar",
    marker: "hjm-sidebar",
    render: () => (
      <Sidebar
        descriptor={{
          accessibilityLabel: "주요 메뉴",
          currentId: "records",
          groups: [{ id: "main", label: "기록", items: [{ id: "records", label: "내 기록" }] }],
        }}
      />
    ),
  },
  {
    componentId: "date-range-picker",
    marker: "hjm-date-range",
    render: () => (
      <DateRangePicker
        descriptor={{ grid: defaultCalendarGrid, monthLabel: "2027년 2월" }}
        composeAccessibleName={({ date }) => date}
        rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
      />
    ),
  },
  {
    componentId: "auth-provider-button",
    marker: "hjm-auth-provider-button",
    render: () => (
      <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<span>G</span>} />
    ),
  },
  {
    componentId: "data-table",
    marker: "hjm-data-table",
    render: () => (
      <DataTable
        columns={[{ id: "title", header: "제목" }, { id: "day", header: "날짜", sortable: true }]}
        rows={[{ id: "walk" }, { id: "meal" }]}
        labels={{
          table: "기록 표", selectAll: "모두 선택",
          selectRow: (id) => `${id} 선택`,
          sortColumn: (header) => `${header} 정렬`,
        }}
        renderCell={(rowId, columnId) => `${rowId}-${columnId}`}
      />
    ),
  },
  {
    componentId: "collapsible",
    marker: "hjm-collapsible",
    render: () => (
      <Collapsible trigger="자세히 보기" defaultOpen>
        <p>접었다 펼 수 있는 본문입니다.</p>
      </Collapsible>
    ),
  },
  {
    componentId: "context-menu",
    marker: "hjm-context-menu-host",
    render: () => (
      <ContextMenu
        accessibilityLabel="기록 메뉴"
        items={[{ id: "edit", label: "수정", textValue: "수정" }, { id: "delete", label: "삭제", textValue: "삭제", tone: "danger" }]}
        onAction={() => undefined}
      >
        <p>여기서 우클릭하세요.</p>
      </ContextMenu>
    ),
  },
  {
    componentId: "menubar",
    marker: "hjm-menubar",
    render: () => (
      <Menubar
        descriptor={{
          accessibilityLabel: "주 메뉴",
          menus: [
            { id: "file", label: "파일", items: [{ id: "new", label: "새로 만들기", textValue: "새로 만들기" }] },
            { id: "edit", label: "편집", items: [{ id: "undo", label: "실행 취소", textValue: "실행 취소" }] },
          ],
        }}
        onAction={() => undefined}
      />
    ),
  },
  {
    componentId: "asset",
    marker: "hjm-asset",
    render: () => (
      <Asset descriptor={{ kind: "lottie", accessibilityLabel: "편지를 나르는 동물" }}>
        <span>🦊</span>
      </Asset>
    ),
  },
  { componentId: "anchor", marker: "hjm-anchor", render: () => <Anchor label="목차" items={[{ id: "intro", label: "소개" }]} /> },
  {
    componentId: "bottom-navigation",
    marker: "hjm-bottom-navigation",
    render: () => (
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "Primary navigation",
          items: [
            { id: "home", label: "Home", icon: { name: "home" } },
            { id: "profile", label: "Profile", icon: { name: "user" } },
          ],
          selectedKey: "home",
        }}
        getHref={({ id }) => `/${id}`}
        renderIcon={({ name }) => <span>{name}</span>}
      />
    ),
  },
  {
    componentId: "load-more",
    marker: "hjm-load-more",
    render: () => (
      <LoadMore
        descriptor={readyLoadMoreDescriptor}
        onLoadMore={async () => undefined}
      />
    ),
  },
  {
    componentId: "carousel",
    marker: "hjm-carousel",
    render: () => <Carousel label="새 소식" slides={[{ id: "one", label: "첫 소식" }, { id: "two", label: "다음 소식" }]}
      labels={{ previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" }}
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      renderSlide={({ label }) => <p>{label}</p>} />,
  },
  {
    componentId: "floating-action-button",
    marker: "hjm-fab",
    render: () => <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }}
      renderIcon={() => <span>＋</span>} onContentClearanceChange={() => {}} />,
  },
  {
    componentId: "steps",
    marker: "hjm-steps",
    render: () => (
      <Steps
        composeAccessibleName={({ position, total, label }) => `${position} of ${total}: ${label}`}
        descriptor={{ steps: [{ id: "account", label: "Account" }, { id: "profile", label: "Profile" }], currentStepId: "profile" }}
        statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }}
      />
    ),
  },
  {
    componentId: "badge",
    marker: "hjm-badge",
    render: () => <Badge>Badge</Badge>,
  },
  {
    componentId: "avatar",
    marker: "hjm-avatar",
    render: () => <Avatar name="Ada Lovelace" />,
  },
  {
    componentId: "counter-badge",
    marker: "hjm-counter-badge",
    render: () => <CounterBadge count={3} />,
  },
  {
    componentId: "card",
    marker: "hjm-card",
    render: () => <Card title="Card">Content</Card>,
  },
  {
    componentId: "list",
    marker: "hjm-list",
    render: () => <List label="Items"><ListRow title="List row" /></List>,
  },
  {
    componentId: "list-row",
    marker: "hjm-list-row",
    render: () => <ListRow title="List row" />,
  },
  {
    componentId: "tag",
    marker: "hjm-tag",
    render: () => <Tag>Tag</Tag>,
  },
  {
    componentId: "accordion",
    marker: "hjm-accordion",
    render: () => (
      <Accordion
        aria-label="Help"
        items={[{ id: "shipping", title: "Shipping", panel: "Arrives tomorrow" }]}
      />
    ),
  },
  {
    componentId: "divider",
    marker: "hjm-divider",
    render: () => <Divider />,
  },
  {
    componentId: "statistic",
    marker: "hjm-statistic",
    render: () => <Statistic descriptor={{ id: "orders", label: "Orders", value: "12" }} />,
  },
  {
    componentId: "section",
    marker: "hjm-section",
    render: () => <Section title="Section">Content</Section>,
  },
  {
    componentId: "upload-item",
    marker: "hjm-upload-item",
    render: () => (
      <UploadItem
        descriptor={{ id: "photo", name: "photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.4 } }}
        labels={{ pending: "Pending", uploading: "Uploading", success: "Complete", cancel: "Cancel", retry: "Retry" }}
        onCancel={() => undefined}
      />
    ),
  },
  {
    componentId: "timeline",
    marker: "hjm-timeline",
    render: () => (
      <Timeline
        composeAccessibleName={({ position, total, label }) =>
          `${position} of ${total}: ${label}`
        }
        items={[{ id: "created", label: "Created" }]}
      />
    ),
  },
  {
    componentId: "description-list",
    marker: "hjm-description-list",
    render: () => (
      <DescriptionList items={[{ id: "status", label: "Status", value: "Ready" }]} />
    ),
  },
  {
    componentId: "image",
    marker: "hjm-image",
    render: () => <Image src="/default-image.png" width={160} height={90} />,
  },
  {
    componentId: "empty-state",
    marker: "hjm-empty-state",
    render: () => <EmptyState title="Empty state" />,
  },
  {
    componentId: "notice",
    marker: "hjm-notice",
    render: () => <Notice title="Notice" />,
  },
  {
    componentId: "progress",
    marker: "hjm-progress",
    render: () => <Progress label="Upload" value={45} valueText="45%" />,
  },
  {
    componentId: "spinner",
    marker: "hjm-spinner",
    render: () => <Spinner label="Loading" />,
  },
  {
    componentId: "skeleton",
    marker: "hjm-skeleton",
    render: () => <Skeleton />,
  },
  {
    componentId: "result",
    marker: "hjm-result",
    render: () => <Result status="success" title="Saved" />,
  },
  {
    componentId: "toast",
    marker: "hjm-toast",
    render: () => (
      <Toast
        descriptor={{
          id: "default-toast",
          description: "Saved",
          closeLabel: "Close",
        }}
        onDismissRequest={() => undefined}
      />
    ),
  },
  {
    componentId: "select",
    marker: "role=\"combobox\"",
    render: () => (
      <Select
        emptySelectionLabel="No selection"
        label="Select"
        placeholder="Choose an option"
        items={[{ id: "one", label: "One", textValue: "One" }]}
      />
    ),
  },
  {
    componentId: "combobox",
    marker: "hjm-combobox",
    render: () => (
      <Combobox
        emptyMessage="No results"
        items={[{ value: "seoul", label: "Seoul" }]}
        label="City"
        loadingMessage="Loading"
        selectionRequiredMessage="Choose a city"
      />
    ),
  },
  {
    componentId: "dialog",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <Dialog closeLabel="Close" trigger={<button type="button">Open</button>} title="Dialog" />
    ),
  },
  {
    componentId: "alert-dialog",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <AlertDialog
        trigger={<button type="button">Open alert</button>}
        request={{
          mode: "alert",
          title: "Alert",
          description: "Alert description",
          confirmLabel: "OK",
        }}
      />
    ),
  },
  {
    componentId: "sheet",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <Sheet closeLabel="Close" trigger={<button type="button">Open sheet</button>} title="Sheet" />
    ),
  },
  {
    componentId: "tooltip",
    marker: "hjm-tooltip",
    render: () => <Tooltip trigger={<button type="button">Help</button>} content="Help text" />,
  },
  {
    componentId: "visually-hidden",
    marker: "hjm-visually-hidden",
    render: () => <VisuallyHidden>Accessible detail</VisuallyHidden>,
  },
  {
    componentId: "menu",
    marker: "aria-haspopup=\"menu\"",
    render: () => (
      <Menu
        trigger={<button type="button">Open menu</button>}
        label="Menu"
        items={[{ id: "one", label: "One" }]}
      />
    ),
  },
];

describe("@hjmds/react default renderer proofs", () => {
  it("keeps one executable default fixture for every evidence component", () => {
    const evidenceIds = reactRendererEvidence.components.map(({ componentId }) => componentId);
    const fixtureIds = defaultRenderFixtures.map(({ componentId }) => componentId);

    expect(fixtureIds).toEqual(evidenceIds);
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length);
    expect(executedScenarioRegistry.executions[0]?.coverageMode).toBe("all-cases");
    expect(executedScenarioRegistry.executions[0]?.proofFile).toBe("test/default-render.ssr.test.tsx");
    expect(rendererEnvironments.map(({ id }) => id)).toEqual(reactRendererEvidence.components[0]?.scenarios);
  });

  it.each(defaultRenderFixtures)("$componentId", ({ componentId, marker, render }) => {
    for (const environment of rendererEnvironments) {
      const html = renderToStaticMarkup(
        <HjmProvider
          direction={environment.direction}
          reducedMotion={environment.reducedMotion}
          systemTheme={environment.theme}
          textScale={environment.textScale}
          theme={environment.theme}
        >
          <div aria-label={environment.id === "long-copy" ? longCopy : undefined} style={{ maxWidth: 320 }}>
            {render()}
          </div>
        </HjmProvider>,
      );
      expect(html, `${componentId}:${environment.id}`).toContain(marker);
      expect(html).toContain(`data-theme="${environment.theme}"`);
      expect(html).toContain(`data-text-scale="${environment.textScale}"`);
      expect(html).toContain(`dir="${environment.direction}"`);
      expect(html).toContain(`data-motion="${environment.reducedMotion ? "reduced" : "full"}"`);
      if (environment.id === "accessibility") {
        expect(html).not.toContain('aria-label=""');
        expect(html).not.toContain('aria-describedby=""');
      }
      if (environment.id === "long-copy") expect(html).toContain(longCopy);
    }
  });
});
