// 2026-10-17 screen compositions registered: screen compositions (catalog rows added the same day).
import { ChatDateSeparator, ChatMessage, ChatScreen, CompositionLayout, IconTile, TypingIndicator, MessageComposer, NotificationInboxScreen, NotificationItem, NotificationRow, ScreenLayout, SettingsScreen } from "../src/screens.js";
import { CommentThreadRow, CommentThreadScreen, EditorScreen, ListDetailScreen, MediaSelectionScreen, ModerationScreen, OnboardingScreen, PermissionScreen, PhotoSourceSheet, ProfileScreen, ProfileSummary, SearchScreen } from "../src/screen-flows.js";
import { ColorPicker } from "../src/color-picker.js";
import { LineChart } from "../src/chart.js";
import { ImageChoiceGroup } from "../src/image-choice.js";
import { Watermark } from "../src/watermark.js";
import { Affix } from "../src/affix.js";
import { Masonry } from "../src/masonry.js";
import { VirtualList } from "../src/virtual-list.js";
import { QRCode } from "../src/qr-code.js";
import { ThinkingOrb } from "../src/thinking-orb.js";
/**
 * Shared default-render fixtures for the renderer evidence proofs. The SSR proof
 * (default-render.ssr.test.tsx) renders each one for the default and
 * accessibility scenarios; the browser proof (scenario-matrix.browser.test.tsx)
 * renders the same fixture under each environment and inspects computed styles.
 */
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
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "../src/auth-screen.js";
import { DataTable } from "../src/data-table.js";
import { Collapsible } from "../src/collapsible.js";
import { ContextMenu } from "../src/context-menu.js";
import { Menubar } from "../src/menubar.js";
import { Asset } from "../src/asset.js";
import { Breadcrumb } from "../src/breadcrumb.js";
import { Pagination } from "../src/pagination.js";
import { Anchor } from "../src/anchor.js";
import { FloatingActionButton } from "../src/floating-action-button.js";
import { Carousel, PageIndicator } from "../src/carousel.js";
import type { ReactNode } from "react";

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

export type DefaultRenderFixture = Readonly<{
  componentId: string;
  /** A class or attribute the component's own root emits, never the provider's. */
  marker: string;
  /** Portal-backed components can expose only their trigger during server rendering. */
  ssrMarker?: string;
  /** Content rendered in a body portal: the long-copy proof inspects this role instead of the marker's subtree. */
  portalRole?: "dialog" | "tooltip";
  /** Chrome fixed to the viewport (FAB, bottom navigation): the long-copy proof narrows the viewport to the container. */
  viewportChrome?: boolean;
  render(): ReactNode;
  /**
   * Renders the component with `copy` in its primary text slot. Only fixtures
   * that provide this may claim the long-copy scenario, because putting the copy
   * on a wrapper (as the 1.4.0 proof did) says nothing about the component.
   */
  renderLongCopy?: (copy: string) => ReactNode;
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


/**
 * Canonical default-render proofs. The component ids are stable case ids used
 * by reactRendererEvidence, while markers prevent an import-only smoke test
 * from satisfying a renderer claim.
 */
/** Shared stubs for the screen composition fixtures below. */
const screenNoop = () => {};
const screenAction = (label: string) => ({ label, onAction: screenNoop });
const screenDiscard = { mode: "confirm" as const, title: "초안을 버릴까요?", description: "입력이 사라집니다", confirmLabel: "버리기", cancelLabel: "계속 작성", fallbackErrorMessage: "실패" };
const screenUploadLabels = { pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" };
const screenPhotoLabels = { title: "사진 가져오기", library: "앨범에서 선택", camera: "카메라로 촬영", cancel: "취소" };
const screenComments = [{ id: "c1", parentId: null, author: "서연", body: <span>첫 댓글이에요</span>, timeLabel: "방금", likeCountLabel: "좋아요 3개", likeIcon: <span aria-hidden="true">♡</span>, likeLabel: "좋아요" }];

export const defaultRenderFixtures: readonly DefaultRenderFixture[] = [
  { componentId: "top-bar", marker: "hjm-top-bar", renderLongCopy: (copy) => <TopBar title={copy} />, render: () => <TopBar title="오늘의 할 일" /> },
  { componentId: "bottom-cta", marker: "hjm-bottom-cta", renderLongCopy: (copy) => <BottomCTA primaryAction={{ label: copy, onClick: () => {} }} />, render: () => <BottomCTA primaryAction={{ label: "계속", onClick: () => {} }} /> },
  {
    componentId: "design-system-provider",
    marker: "data-hjm-provider",
    renderLongCopy: (copy) => <HjmProvider systemTheme="light"><Text>{copy}</Text></HjmProvider>,
    render: () => <HjmProvider systemTheme="light">Provider</HjmProvider>,
  },
  {
    componentId: "text",
    marker: "hjm-text",
    renderLongCopy: (copy) => <Text>{copy}</Text>,
    render: () => <Text>Text</Text>,
  },
  {
    componentId: "surface",
    marker: "hjm-surface",
    renderLongCopy: (copy) => <Surface>{copy}</Surface>,
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
    renderLongCopy: (copy) => <Stack><Text>{copy}</Text></Stack>,
    render: () => <Stack>Stack</Stack>,
  },
  {
    componentId: "container",
    marker: "hjm-container",
    renderLongCopy: (copy) => <Container size="reading"><Text>{copy}</Text></Container>,
    render: () => <Container size="reading">Readable content</Container>,
  },
  {
    componentId: "aspect-ratio",
    marker: "hjm-aspect-ratio",
    renderLongCopy: (copy) => <AspectRatio ratio="wide"><Text>{copy}</Text></AspectRatio>,
    render: () => <AspectRatio ratio="wide"><div>Media</div></AspectRatio>,
  },
  {
    componentId: "grid",
    marker: "hjm-grid",
    renderLongCopy: (copy) => <Grid columns={{ compact: 1, medium: 2 }}><Text>{copy}</Text></Grid>,
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
    renderLongCopy: (copy) => <Layout header="내비게이션" skipLinkLabel="본문으로 건너뛰기"><Text>{copy}</Text></Layout>,
    render: () => <Layout>Primary content</Layout>,
  },
  {
    componentId: "button",
    marker: "hjm-button",
    renderLongCopy: (copy) => <Button>{copy}</Button>,
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
    renderLongCopy: (copy) => <Link href="/docs">{copy}</Link>,
    render: () => <Link href="/docs">Docs</Link>,
  },
  {
    componentId: "field",
    marker: "hjm-field",
    renderLongCopy: (copy) => <TextField label={copy} />,
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
    marker: "hjm-search-field",
    renderLongCopy: (copy) => <SearchField clearLabel="Clear search" label={copy} />,
    render: () => <SearchField clearLabel="Clear search" label="Search" />,
  },
  {
    componentId: "text-area",
    marker: "textarea",
    renderLongCopy: (copy) => <TextArea label="Notes" defaultValue={copy} />,
    render: () => <TextArea label="Notes" />,
  },
  {
    componentId: "password-field",
    marker: "hjm-password-field",
    renderLongCopy: (copy) => <PasswordField autofillHint="current" concealLabel="Hide password" label={copy} revealLabel="Show password" />,
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
    marker: "hjm-otp-field",
    renderLongCopy: (copy) => <OtpField label={copy} length={6} />,
    render: () => <OtpField label="Verification code" length={6} />,
  },
  {
    componentId: "number-field",
    marker: "hjm-number-field",
    renderLongCopy: (copy) => <NumberField decrementLabel="Decrease" incrementLabel="Increase" label={copy} min={0} max={10} />,
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
    renderLongCopy: (copy) => <Slider label={copy} min={0} max={10} />,
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
    renderLongCopy: (copy) => (
      <DatePicker clearLabel="Clear date" closeLabel="Close calendar" composeAccessibleName={({ date }) => date}
        descriptor={{ grid: defaultCalendarGrid, displayValue: null, placeholder: "Choose a date", label: copy, selectedDate: null, onSelectionChange: () => undefined, open: false, onOpenChange: () => undefined }}
        monthLabel="February 2027" />
    ),
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
    renderLongCopy: (copy) => <Calendar descriptor={{ grid: defaultCalendarGrid, monthLabel: copy }} composeAccessibleName={({ date }) => date} />,
    render: () => <Calendar descriptor={{ grid: defaultCalendarGrid, monthLabel: "February 2027" }} composeAccessibleName={({ date }) => date} />,
  },
  {
    componentId: "file-picker",
    marker: "hjm-file-picker",
    renderLongCopy: (copy) => (
      <FilePicker buttonLabel={copy} descriptor={{ accept: ["image/*"] }} dropzoneLabel={copy} label={copy} onSelect={() => undefined} />
    ),
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
    marker: "hjm-choice",
    renderLongCopy: (copy) => <Checkbox label={copy} />,
    render: () => <Checkbox label="Checkbox" />,
  },
  {
    componentId: "radio",
    marker: "data-kind=\"radio\"",
    renderLongCopy: (copy) => <Radio label={copy} name="long-copy-radio" />,
    render: () => <Radio label="Radio" name="default-radio" />,
  },
  {
    componentId: "checkbox-group",
    marker: "hjm-checkbox-group",
    renderLongCopy: (copy) => <CheckboxGroup label="Checkbox group" items={[{ id: "one", label: copy }]} />,
    render: () => (
      <CheckboxGroup label="Checkbox group" items={[{ id: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "radio-group",
    marker: "hjm-radio-group",
    renderLongCopy: (copy) => <RadioGroup label="Radio group" items={[{ value: "one", label: copy }]} />,
    render: () => (
      <RadioGroup label="Radio group" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "switch",
    marker: "role=\"switch\"",
    renderLongCopy: (copy) => <Switch label={copy} />,
    render: () => <Switch label="Switch" />,
  },
  {
    componentId: "segmented-control",
    marker: "hjm-segmented",
    renderLongCopy: (copy) => <SegmentedControl label="Segmented" items={[{ value: "one", label: copy }]} />,
    render: () => (
      <SegmentedControl label="Segmented" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "chip",
    marker: "hjm-chip",
    renderLongCopy: (copy) => <Chip label={copy} />,
    render: () => <Chip label="Filter" />,
  },
  {
    componentId: "tabs",
    marker: "role=\"tablist\"",
    renderLongCopy: (copy) => (
      <Tabs label="Tabs" items={[{ id: "one", label: copy, panel: "First panel" }, { id: "two", label: "Second", panel: "Second panel" }]} />
    ),
    render: () => (
      <Tabs label="Tabs" items={[{ id: "one", label: "One", panel: "Panel" }]} />
    ),
  },
  {
    componentId: "breadcrumb",
    marker: "hjm-breadcrumb",
    renderLongCopy: (copy) => <Breadcrumb label={copy} items={[
      { id: "all", label: copy, destination: { kind: "internal", href: "#all" } },
      { id: "current", label: copy },
    ]} />,
    render: () => <Breadcrumb label="현재 위치" items={[{ id: "all", label: "전체", destination: { kind: "internal", href: "#all" } }, { id: "current", label: "일상" }]} />,
  },
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
    renderLongCopy: (copy) => (
      <Splitter label="패널 크기 조절" min={20} max={80} step={5} defaultValue={40}
        primaryPane={<Text>{copy}</Text>} secondaryPane={<Text>{copy}</Text>} />
    ),
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
    renderLongCopy: (copy) => (
      <Tree
        label="폴더"
        nodes={[{ id: "root", label: "기록", textValue: "기록", children: [{ id: "leaf", label: copy, textValue: copy }] }]}
        defaultExpandedKeys={new Set(["root"])}
        composeAccessibleName={({ depth, position, siblingCount, label: name }) => `${depth}단계 ${siblingCount}개 중 ${position}번째, ${name}`}
      />
    ),
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
    renderLongCopy: (copy) => (
      <TransferList
        items={[{ id: "long", label: copy, textValue: copy }]}
        labels={{ source: copy, target: "Selected", toTarget: "Move to selected", toSource: "Move back", selectAll: "Select all", empty: copy }}
      />
    ),
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
    renderLongCopy: (copy) => (
      <Mentions
        label={copy}
        value=""
        onValueChange={() => {}}
        triggers={[{ id: "person", trigger: "@" }]}
        candidates={[]}
        emptyMessage="No people found"
        listLabel="Suggested people"
      />
    ),
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
    renderLongCopy: (copy) => (
      <Agreement requiredLabel="(필수)" optionalLabel="(선택)" descriptor={{
        accessibilityLabel: copy,
        allLabel: copy,
        items: [{ id: "terms-long", label: copy, required: true }],
      }} />
    ),
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
    renderLongCopy: (copy) => <Top descriptor={{ title: copy, description: copy }} />,
    render: () => <Top descriptor={{ title: "오늘 기록을 남겨요", description: "짧아도 괜찮아요" }} />,
  },
  {
    componentId: "heading",
    marker: "hjm-heading",
    renderLongCopy: (copy) => <Heading level="level2">{copy}</Heading>,
    render: () => <Heading level="level2">기록 모아보기</Heading>,
  },
  {
    componentId: "text-format",
    marker: "hjm-text-format",
    renderLongCopy: (copy) => <TextFormat kind="code">{copy}</TextFormat>,
    render: () => <TextFormat kind="kbd">Enter</TextFormat>,
  },
  {
    componentId: "toggle-group",
    marker: "hjm-toggle-group",
    renderLongCopy: (copy) => <ToggleGroup descriptor={{ accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: copy }] }} />,
    render: () => (
      <ToggleGroup descriptor={{ accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: "굵게" }] }} />
    ),
  },
  {
    componentId: "tags-input",
    marker: "hjm-tags-input",
    renderLongCopy: (copy) => <TagsInput label={copy} composeRemoveLabel={(tag) => `${tag} 지우기`} defaultTags={["산책"]} />,
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
    renderLongCopy: (copy) => <BottomInfo items={[copy]} />,
    render: () => <BottomInfo items={["가입하면 약관에 동의하는 것으로 봅니다"]} />,
  },
  {
    componentId: "sidebar",
    marker: "hjm-sidebar",
    renderLongCopy: (copy) => (
      <Sidebar
        descriptor={{
          accessibilityLabel: "Primary navigation",
          currentId: "records",
          groups: [{ id: "main", label: copy, items: [{ id: "records", label: copy }] }],
        }}
        collapseLabels={{ collapse: "Collapse navigation", expand: "Expand navigation" }}
      />
    ),
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
    renderLongCopy: (copy) => <AuthProviderButton descriptor={{ provider: "google", label: copy }} logo={<span>G</span>} />,
    render: () => (
      <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<span>G</span>} />
    ),
  },
  {
    componentId: "auth-screen",
    marker: "hjm-auth-screen",
    renderLongCopy: (copy) => <AuthScreenLayout hero={<AuthScreenHero title={copy} description={copy} />} main={<Text>Sign in</Text>} footer={<AuthScreenFooter notice={copy} links={[{ label: copy, href: "/terms" }]} />} />,
    render: () => (
      <AuthScreenLayout hero={<AuthScreenHero eyebrow="eyebrow" title="hero" description="description" />} main={<span>main</span>} footer={<AuthScreenFooter links={[{ label: "Terms", href: "/terms" }, { label: "Privacy", onClick: () => undefined }]} />} />
    ),
  },
  {
    componentId: "data-table",
    marker: "hjm-data-table",
    renderLongCopy: (copy) => (
      <DataTable
        columns={[{ id: "title", header: "제목" }, { id: "day", header: "날짜" }]}
        rows={[{ id: "long" }]}
        labels={{
          table: "기록 표", selectAll: "모두 선택",
          selectRow: (id) => `${id} 선택`,
          sortColumn: (header) => `${header} 정렬`,
        }}
        renderCell={(_rowId, columnId) => columnId === "title" ? copy : "오늘"}
      />
    ),
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
    renderLongCopy: (copy) => (
      <Collapsible trigger={copy} defaultOpen>
        <p>상세한 배송 안내를 확인해 주세요.</p>
      </Collapsible>
    ),
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
    renderLongCopy: (copy) => (
      <Menubar descriptor={{ accessibilityLabel: "Main menu", menus: [{
        id: "long-label",
        label: copy,
        items: [{ id: "long-item", label: copy, textValue: copy }],
      }] }} onAction={() => undefined} />
    ),
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
  { componentId: "anchor", marker: "hjm-anchor", renderLongCopy: (copy) => <Anchor label={copy} items={[{ id: "intro", label: copy }]} />, render: () => <Anchor label="목차" items={[{ id: "intro", label: "소개" }]} /> },
  {
    componentId: "bottom-navigation",
    viewportChrome: true,
    marker: "hjm-bottom-navigation",
    renderLongCopy: (copy) => (
      <BottomNavigation
        descriptor={{ accessibilityLabel: "Primary navigation", items: [{ id: "home", label: "Home", icon: { name: "home" } }, { id: "search", label: copy, icon: { name: "search" } }], selectedKey: "home" }}
        getHref={({ id }) => `/${id}`}
        onActivate={() => undefined}
        renderIcon={({ name }) => <span>{name}</span>}
      />
    ),
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
    renderLongCopy: (copy) => (
      <LoadMore descriptor={{ state: { status: "complete" }, labels: { complete: copy, loadMore: copy, loading: copy, retry: copy } }} onLoadMore={async () => undefined} />
    ),
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
    renderLongCopy: (copy) => <Carousel label={copy} slides={[{ id: "one", label: copy }, { id: "two", label: "다음 소식" }]}
      labels={{ previous: copy, next: copy, pause: copy, resume: copy, navigation: copy }}
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      renderSlide={({ label }) => <p>{label}</p>} />,
    render: () => <Carousel label="새 소식" slides={[{ id: "one", label: "첫 소식" }, { id: "two", label: "다음 소식" }]}
      labels={{ previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" }}
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      renderSlide={({ label }) => <p>{label}</p>} />,
  },
  {
    componentId: "floating-action-button",
    viewportChrome: true,
    marker: "hjm-fab",
    renderLongCopy: (copy) => <FloatingActionButton descriptor={{ label: copy, icon: { name: "add" } }} renderIcon={() => <span>＋</span>} onContentClearanceChange={() => {}} />,
    render: () => <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }}
      renderIcon={() => <span>＋</span>} onContentClearanceChange={() => {}} />,
  },
  {
    componentId: "steps",
    marker: "hjm-steps",
    renderLongCopy: (copy) => <Steps composeAccessibleName={({ position, total, label }) => `${position} of ${total}: ${label}`} descriptor={{ steps: [{ id: "one", label: copy }, { id: "two", label: "Review" }], currentStepId: "one" }} statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }} />,
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
    renderLongCopy: (copy) => <Badge>{copy}</Badge>,
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
    renderLongCopy: (copy) => <Card title={copy}>{copy}</Card>,
    render: () => <Card title="Card">Content</Card>,
  },
  {
    componentId: "list",
    marker: "hjm-list",
    renderLongCopy: (copy) => <List label="Items"><ListRow title={copy} /></List>,
    render: () => <List label="Items"><ListRow title="List row" /></List>,
  },
  {
    componentId: "list-row",
    marker: "hjm-list-row",
    // ListRow surfaces bleed into the host gutter by contract; use the supported padded container.
    renderLongCopy: (copy) => <div style={{ paddingInline: 16 }}><ListRow title={copy} /></div>,
    render: () => <ListRow title="List row" />,
  },
  {
    componentId: "tag",
    marker: "hjm-tag",
    renderLongCopy: (copy) => <Tag>{copy}</Tag>,
    render: () => <Tag>Tag</Tag>,
  },
  {
    componentId: "accordion",
    marker: "hjm-accordion",
    renderLongCopy: (copy) => (
      <Accordion aria-label="Help" items={[{ id: "long-copy", title: copy, panel: <p>{copy}</p> }]} />
    ),
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
    renderLongCopy: (copy) => <Statistic descriptor={{ id: "orders", label: copy, value: "12" }} />,
    render: () => <Statistic descriptor={{ id: "orders", label: "Orders", value: "12" }} />,
  },
  {
    componentId: "section",
    marker: "hjm-section",
    renderLongCopy: (copy) => <Section title={copy}>{copy}</Section>,
    render: () => <Section title="Section">Content</Section>,
  },
  {
    componentId: "upload-item",
    marker: "hjm-upload-item",
    renderLongCopy: (copy) => (
      <UploadItem
        descriptor={{ id: "photo", name: copy, sizeLabel: copy, state: { status: "uploading", progress: 0.4, progressLabel: copy } }}
        labels={{ pending: "Pending", uploading: copy, success: "Complete", cancel: "Cancel", retry: "Retry" }}
        onCancel={() => undefined}
      />
    ),
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
    renderLongCopy: (copy) => <Timeline composeAccessibleName={({ position, total, label }) => `${position} of ${total}: ${label}`} items={[{ id: "created", label: copy }]} />,
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
    renderLongCopy: (copy) => <DescriptionList items={[{ id: "status", label: "Status", value: copy }]} />,
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
    renderLongCopy: (copy) => <EmptyState title={copy} />,
    render: () => <EmptyState title="Empty state" />,
  },
  {
    componentId: "notice",
    marker: "hjm-notice",
    renderLongCopy: (copy) => <Notice title={copy} />,
    render: () => <Notice title="Notice" />,
  },
  {
    componentId: "progress",
    marker: "hjm-progress",
    renderLongCopy: (copy) => <Progress label={copy} value={45} valueText="45%" />,
    render: () => <Progress label="Upload" value={45} valueText="45%" />,
  },
  {
    componentId: "thinking-orb", marker: "data-hjm-thinking-orb", render: () => <ThinkingOrb label="Searching" paused />,
  },
  { componentId: "color-picker", marker: "data-hjm-color-picker", render: () => <ColorPicker label="Color" labels={{color:"Choose color",hex:"Hex",opacity:"Opacity",invalid:"Invalid color"}} value="#b94627" onValueChange={() => {}} alpha presets={["#b94627ff", "#338844ff"]} />, renderLongCopy: copy => <ColorPicker label={copy} labels={{color:copy,hex:copy,opacity:copy,invalid:copy}} value="#b94627" onValueChange={() => {}} alpha /> },
  { componentId: "watermark", marker: "data-hjm-watermark", render: () => <Watermark text="DRAFT"><p>Document content</p><button>Save</button></Watermark>, renderLongCopy: copy => <Watermark text="DRAFT"><p>{copy}</p></Watermark> },
  { componentId: "affix", marker: "data-hjm-affix", render: () => <Affix><button>Save</button></Affix>, renderLongCopy: copy => <Affix><p>{copy}</p></Affix> },
  { componentId: "masonry", renderLongCopy: (copy) => <Masonry items={[copy]} keyExtractor={item => item} label="Cards" width={240} columns={1} getItemHeight={() => 300} renderItem={item => <span style={{ overflowWrap: "anywhere" }}>{item}</span>} />, marker: "data-hjm-masonry", render: () => <Masonry items={["First", "Second"]} keyExtractor={item => item} label="Cards" width={240} getItemHeight={() => 120} renderItem={item => <span>{item}</span>} /> },
  { componentId: "virtual-list", renderLongCopy: (copy) => <VirtualList items={[copy]} keyExtractor={item => item} label="Items" height={300} rowHeight={300} renderItem={item => <span style={{ overflowWrap: "anywhere" }}>{item}</span>} />, marker: "data-hjm-virtual-list", render: () => <VirtualList items={["First", "Second"]} keyExtractor={item => item} label="Items" height={200} rowHeight={100} renderItem={item => <span>{item}</span>} /> },
  { componentId: "qr-code", renderLongCopy: (copy) => <QRCode value="https://example.com" label="Share code" fallback={<span style={{ overflowWrap: "anywhere" }}>{copy}</span>} />, marker: "data-hjm-qr-code", render: () => <QRCode value="https://example.com" label="Share code" fallback={<a href="https://example.com">Open destination</a>} /> },
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
    renderLongCopy: (copy) => <Result status="success" title={copy} />,
    render: () => <Result status="success" title="Saved" />,
  },
  {
    componentId: "toast",
    marker: "hjm-toast",
    renderLongCopy: (copy) => <Toast descriptor={{ id: "long-toast", description: copy, closeLabel: "Close" }} onDismissRequest={() => undefined} />,
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
    marker: "hjm-select",
    renderLongCopy: (copy) => (
      <Select defaultSelectedKey="one" emptySelectionLabel="No selection" label={copy} placeholder="Choose an option" items={[{ id: "one", label: "One", textValue: "One" }]} />
    ),
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
    renderLongCopy: (copy) => (
      <Combobox emptyMessage="No results" items={[{ value: "seoul", label: "Seoul" }]} label={copy} loadingMessage="Loading" selectionRequiredMessage="Choose a city" />
    ),
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
    // Portal content intentionally waits for hydration; SSR proves the trigger while browser evidence inspects the modal.
    marker: "role=\"dialog\"",
    portalRole: "dialog",
    ssrMarker: "Open dialog",
    renderLongCopy: (copy) => (
      <Dialog closeLabel="Close" onOpenChange={() => undefined} open title={copy} description={copy} trigger={<button type="button">Open dialog</button>}>
        <p>{copy}</p>
      </Dialog>
    ),
    render: () => (
      <Dialog closeLabel="Close" onOpenChange={() => undefined} open title="Dialog" description="Dialog description" trigger={<button type="button">Open dialog</button>} />
    ),
  },
  {
    componentId: "alert-dialog",
    marker: "aria-haspopup=\"dialog\"",
    renderLongCopy: (copy) => (
      <AlertDialog
        defaultOpen
        trigger={<button type="button">Open alert</button>}
        request={{ mode: "alert", title: copy, description: copy, confirmLabel: "OK" }}
      />
    ),
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
    portalRole: "tooltip",
    renderLongCopy: (copy) => (
      <Tooltip defaultOpen trigger={<button type="button">Help</button>} content={copy} />
    ),
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
  // 2026-10-17 screen compositions registered.
  {
    componentId: "screen-layout",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <ScreenLayout title={copy}><span>본문</span></ScreenLayout>,
    render: () => <ScreenLayout title="화면"><span>본문</span></ScreenLayout>,
  },
  {
    componentId: "composition-layout",
    marker: "hjm-stack",
    renderLongCopy: (copy) => <CompositionLayout title={copy} description={copy}><span>본문</span></CompositionLayout>,
    render: () => <CompositionLayout title="구성" description="설명"><span>본문</span></CompositionLayout>,
  },
  {
    componentId: "settings-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <SettingsScreen title={copy} sections={[{ id: "account", title: copy, children: <span>이메일</span> }]} />,
    render: () => <SettingsScreen title="설정" sections={[{ id: "account", title: "계정", children: <span>이메일</span> }]} />,
  },
  {
    componentId: "search-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <SearchScreen title={copy} queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={screenNoop} onSearch={screenNoop}><span>결과</span></SearchScreen>,
    render: () => <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={screenNoop} onSearch={screenNoop}><span>결과</span></SearchScreen>,
  },
  {
    componentId: "editor-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <EditorScreen title={copy} dirty={false} submit={screenAction("저장")} cancel={screenAction("닫기")} discard={screenDiscard}><span>본문</span></EditorScreen>,
    render: () => <EditorScreen title="작성" dirty={false} submit={screenAction("저장")} cancel={screenAction("닫기")} discard={screenDiscard}><span>본문</span></EditorScreen>,
  },
  {
    componentId: "permission-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <PermissionScreen title={copy} status="prompt" explanation={<span>{copy}</span>} request={screenAction("허용")} settings={screenAction("설정")} continueAction={screenAction("계속")} />,
    render: () => <PermissionScreen title="카메라" status="prompt" explanation={<span>사진을 올리려면 카메라가 필요해요</span>} request={screenAction("허용")} settings={screenAction("설정")} continueAction={screenAction("계속")} />,
  },
  {
    componentId: "onboarding-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <OnboardingScreen steps={[{ id: "one", title: copy, description: copy, content: <span>내용</span> }]} index={0} onIndexChange={screenNoop} nextLabel="다음" backLabel="이전" complete={screenAction("완료")} progressLabel={(index, total) => `${index}/${total}`} />,
    render: () => <OnboardingScreen steps={[{ id: "one", title: "시작", description: "안내", content: <span>내용</span> }]} index={0} onIndexChange={screenNoop} nextLabel="다음" backLabel="이전" complete={screenAction("완료")} progressLabel={(index, total) => `${index}/${total}`} />,
  },
  {
    componentId: "moderation-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <ModerationScreen title={copy} reasons={[{ value: "spam", label: "스팸" }]} reason={null} onReasonChange={screenNoop} reasonLabel="사유" submit={screenAction("보내기")} />,
    render: () => <ModerationScreen title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason={null} onReasonChange={screenNoop} reasonLabel="사유" submit={screenAction("보내기")} />,
  },
  {
    componentId: "chat-screen",
    marker: "hjm-chat-screen",
    renderLongCopy: (copy) => <ChatScreen title={copy} composer={<span>작성창</span>} />,
    render: () => <ChatScreen title="대화" composer={<span>작성창</span>} />,
  },
  {
    componentId: "notification-inbox-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <NotificationInboxScreen title={copy}><span>알림 목록</span></NotificationInboxScreen>,
    render: () => <NotificationInboxScreen title="알림"><span>알림 목록</span></NotificationInboxScreen>,
  },
  {
    componentId: "comment-thread-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <CommentThreadScreen title={copy} items={[{ ...screenComments[0]!, body: <span>{copy}</span> }]} expandedIds={[]} onExpandedChange={screenNoop} onLike={screenNoop} onReply={screenNoop} replyLabel="답글" repliesLabel={(count) => `답글 ${count}개`} />,
    render: () => <CommentThreadScreen title="댓글" items={screenComments} expandedIds={[]} onExpandedChange={screenNoop} onLike={screenNoop} onReply={screenNoop} replyLabel="답글" repliesLabel={(count) => `답글 ${count}개`} />,
  },
  {
    componentId: "list-detail-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <ListDetailScreen title={copy} list={<span>목록</span>} back={screenAction("뒤로")} />,
    render: () => <ListDetailScreen title="목록" list={<span>목록</span>} back={screenAction("뒤로")} />,
  },
  {
    componentId: "media-selection-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <MediaSelectionScreen title={copy} items={[]} done={screenAction("완료")} labels={screenUploadLabels} actionLabels={{ remove: "제거", moveUp: "위로", moveDown: "아래로" }} removeLabel={() => "제거"} moveUpLabel={() => "위로"} moveDownLabel={() => "아래로"} onRemove={screenNoop} onMove={screenNoop} onRetry={screenNoop} onCancel={screenNoop} />,
    render: () => <MediaSelectionScreen title="사진 선택" items={[]} done={screenAction("완료")} labels={screenUploadLabels} actionLabels={{ remove: "제거", moveUp: "위로", moveDown: "아래로" }} removeLabel={() => "제거"} moveUpLabel={() => "위로"} moveDownLabel={() => "아래로"} onRemove={screenNoop} onMove={screenNoop} onRetry={screenNoop} onCancel={screenNoop} />,
  },
  {
    componentId: "profile-screen",
    marker: "hjm-screen",
    renderLongCopy: (copy) => <ProfileScreen title={copy} summary={<span>요약</span>} edit={screenAction("편집")} />,
    render: () => <ProfileScreen title="프로필" summary={<span>요약</span>} edit={screenAction("편집")} />,
  },
  {
    componentId: "chat-message",
    marker: "hjm-chat-message",
    renderLongCopy: (copy) => <ChatMessage direction="incoming" author="서연" timestamp="지금">{copy}</ChatMessage>,
    render: () => <ChatMessage direction="incoming" author="서연" timestamp="지금">안녕하세요</ChatMessage>,
  },
  {
    componentId: "notification-row",
    marker: "data-hjm-notification-row",
    renderLongCopy: (copy) => <NotificationRow preview={<span>{copy}</span>} metadata="방금" avatar={<span aria-hidden="true">S</span>} />,
    render: () => <NotificationRow preview={<span>새 답글이 달렸어요</span>} metadata="방금" avatar={<span aria-hidden="true">S</span>} />,
  },
  {
    componentId: "notification-item",
    marker: "hjm-notification-item",
    renderLongCopy: (copy) => <div style={{ paddingInline: 16 }}><NotificationItem title={copy} read={false} statusLabel="읽지 않음" timestamp="방금" /></div>,
    render: () => <NotificationItem title="답글" read={false} statusLabel="읽지 않음" timestamp="방금" />,
  },
  {
    componentId: "comment-thread-row",
    marker: "hjm-comment-row__text",
    // bodyText is the row's inline text slot; body is a product ReactNode slot the proof must not measure.
    renderLongCopy: (copy) => <CommentThreadRow item={{ ...screenComments[0]!, bodyText: copy }} onLike={screenNoop} onReply={screenNoop} replyLabel="답글" />,
    render: () => <CommentThreadRow item={screenComments[0]!} onLike={screenNoop} onReply={screenNoop} replyLabel="답글" />,
  },
  {
    componentId: "profile-summary",
    marker: "hjm-stack",
    renderLongCopy: (copy) => <ProfileSummary name={copy} avatar={<span aria-hidden="true">S</span>} />,
    render: () => <ProfileSummary name="서연" avatar={<span aria-hidden="true">S</span>} />,
  },
  {
    componentId: "icon-tile",
    marker: "data-hjm-icon-tile",
    renderLongCopy: (copy) => <IconTile icon={<span aria-hidden="true">★</span>} label={copy} labelLines={2} />,
    render: () => <IconTile icon={<span aria-hidden="true">★</span>} label="도구" />,
  },
  {
    componentId: "typing-indicator",
    marker: "hjm-typing-indicator",
    renderLongCopy: (copy) => <TypingIndicator label={copy} />,
    render: () => <TypingIndicator label="서연 님이 입력 중" />,
  },
  {
    componentId: "chat-date-separator",
    marker: "hjm-chat-date-separator",
    renderLongCopy: (copy) => <ChatDateSeparator label={copy} />,
    render: () => <ChatDateSeparator label="10월 18일 토요일" dateTime="2026-10-18" />,
  },
  {
    componentId: "page-indicator",
    marker: "hjm-page-indicator",
    renderLongCopy: (copy) => <PageIndicator label={copy} count={3} currentIndex={0} onCurrentIndexChange={screenNoop} composeAccessibleName={({ position, total }) => `${position}/${total}`} />,
    render: () => <PageIndicator label="홈 화면" count={3} currentIndex={0} onCurrentIndexChange={screenNoop} composeAccessibleName={({ position, total }) => `${position}/${total}`} />,
  },
  {
    componentId: "message-composer",
    marker: "hjm-message-composer",
    renderLongCopy: (copy) => <MessageComposer value="" label="메시지" sendLabel="전송" description={copy} onValueChange={screenNoop} onSend={screenNoop} />,
    render: () => <MessageComposer value="" label="메시지" sendLabel="전송" onValueChange={screenNoop} onSend={screenNoop} />,
  },
  {
    componentId: "photo-source-sheet",
    marker: "hjm-sheet",
    portalRole: "dialog",
    renderLongCopy: (copy) => <PhotoSourceSheet open onOpenChange={screenNoop} onSelect={screenNoop} labels={{ ...screenPhotoLabels, library: copy }} />,
    render: () => <PhotoSourceSheet open onOpenChange={screenNoop} onSelect={screenNoop} labels={screenPhotoLabels} />,
  },
  // 2026-10-18: both rows were active Web contracts without first-party evidence (check-workspace-sync failed on them).
  {
    componentId: "chart",
    marker: "hjm-chart",
    render: () => <LineChart categories={["3월", "4월", "5월"]} series={[{ id: "ops", label: "OPS", values: [0.8, null, 0.9] }]} accessibilityLabel="월별 OPS" formatValue={(value) => value.toFixed(3)} missingLabel="기록 없음" />,
  },
  {
    componentId: "image-choice-group",
    marker: "hjm-image-choice",
    render: () => <ImageChoiceGroup label="프로필 사진" selectionMode="single" value="a" onValueChange={screenNoop} items={[{ id: "a", label: "웃는 얼굴", image: <span aria-hidden="true" /> }, { id: "b", label: "윙크", image: <span aria-hidden="true" /> }]} />,
  },
];
