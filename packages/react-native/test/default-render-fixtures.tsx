import { Masonry } from "../src/masonry.js";
import { VirtualList } from "../src/virtual-list.js";
import { QRCode } from "../src/qr-code.js";
import { vi } from "vitest";
import { ThinkingOrb } from "../src/thinking-orb.js";
// Default proof exercises the opt-in entry without loading a native binary in Node.
// Installed Skia linkage is checked separately by the focused showcase smoke.
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Rect: View, Path: View }; });
vi.mock("react-native-reanimated", async () => {
  const { useRef } = await import("react");
  return { useSharedValue: (value: unknown) => useRef({ value }).current };
});
vi.mock("@shopify/react-native-skia", async () => {
  const { View } = await import("react-native");
  return { Canvas: View, Picture: View, PaintStyle: { Stroke: 1 },
    Skia: { Paint: () => ({ setAntiAlias() {}, setStyle() {}, setColor() {}, setAlphaf() {}, setStrokeWidth() {}, dispose() {} }), Color: (v: string) => v, XYWHRect: (_x: number, _y: number, w: number, h: number) => [w, h] },
    createPicture: (draw: (canvas: unknown) => void) => { draw({ drawLine() {}, drawCircle() {} }); return {}; },
  };
});
/**
 * Shared default-render cases for the React Native evidence proofs: the default
 * proof (default-render.test.tsx) and the environment matrix
 * (scenario-matrix.test.tsx) render the same case.
 */
import { Agreement } from "../src/agreement.js";
import { Top } from "../src/top.js";
import { Heading } from "../src/heading.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { BottomInfo } from "../src/bottom-info.js";
import { Collapsible } from "../src/collapsible.js";
import { Asset } from "../src/asset.js";
import { TagsInput } from "../src/tags-input.js";
import { DateRangePicker } from "../src/date-range.js";
import { Mentions } from "../src/mentions.js";
import { TransferList } from "../src/transfer-list.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { AuthScreenLayout } from "../src/auth-screen.js";
import { FloatingActionButton } from "../src/floating-action-button.js";
import { Carousel } from "../src/carousel.js";
import type { ReactNode } from "react";
import { View } from "react-native";

import {
  Accordion,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  BottomCTA,
  BottomNavigation,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  Container,
  CounterBadge,
  DatePicker,
  Calendar,
  DescriptionList,
  Dialog,
  Divider,
  EmptyState,
  Field,
  FilePicker,
  Grid,
  HjmNativeProvider,
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
  Section,
  Select,
  SegmentedControl,
  Sheet,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Steps,
  Statistic,
  Surface,
  Switch,
  Tabs,
  Tag,
  Text,
  TextArea,
  Timeline,
  ToastRegion,
  TopBar,
  TopBarAction,
  Form,
  UploadItem,
} from "../src/index.js";


export type DefaultRenderCase = Readonly<{
  componentId: string;
  render: () => ReactNode;
  /**
   * Renders the component with `copy` in its primary text slot. Only cases
   * that provide this may claim long-copy (see scenario-matrix.test.tsx).
   */
  renderLongCopy?: (copy: string) => ReactNode;
}>;

const noop = () => undefined;

const defaultCalendarGrid = {
  cells: [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 4 }, () => ({})),
  ],
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  todayDate: "2027-02-19",
} as const;


/** Literal case ids are consumed by the fail-closed evidence checker. */
export const defaultRenderCases = [
  {
    componentId: "design-system-provider",
    renderLongCopy: (copy) => <HjmNativeProvider reducedMotion><Text>{copy}</Text></HjmNativeProvider>,
    render: () => <HjmNativeProvider reducedMotion><Text>중첩 공급자</Text></HjmNativeProvider>,
  },
  { componentId: "text", renderLongCopy: (copy) => <Text>{copy}</Text>, render: () => <Text>본문</Text> },
  { componentId: "surface", renderLongCopy: (copy) => <Surface><Text>{copy}</Text></Surface>, render: () => <Surface><Text>표면</Text></Surface> },
  { componentId: "stack", renderLongCopy: (copy) => <Stack><Text>{copy}</Text></Stack>, render: () => <Stack><Text>스택</Text></Stack> },
  { componentId: "container", renderLongCopy: (copy) => <Container size="reading"><Text>{copy}</Text></Container>, render: () => <Container size="reading"><Text>본문</Text></Container> },
  { componentId: "aspect-ratio", renderLongCopy: (copy) => <AspectRatio ratio="wide"><Text>{copy}</Text></AspectRatio>, render: () => <AspectRatio ratio="wide"><View /></AspectRatio> },
  {
    componentId: "grid",
    renderLongCopy: (copy) => <Grid availableWidth={320} columns={{ compact: 2 }}><Text>{copy}</Text></Grid>,
    render: () => (
      <Grid availableWidth={320} columns={{ compact: 2 }}>
        <Text key="first">첫 번째</Text>
        <Text key="second">두 번째</Text>
      </Grid>
    ),
  },
  { componentId: "layout", renderLongCopy: (copy) => <Layout header={<Text>내비게이션</Text>}><Text>{copy}</Text></Layout>, render: () => <Layout><Text>본문</Text></Layout> },
  {
    componentId: "icon",
    render: () => (
      <Icon
        descriptor={{ name: "check", decorative: true }}
        renderGlyph={({ name }) => <Text>{name}</Text>}
      />
    ),
  },
  { componentId: "section", renderLongCopy: (copy) => <Section title={copy}><Text>{copy}</Text></Section>, render: () => <Section title="섹션"><Text>내용</Text></Section> },
  { componentId: "button", renderLongCopy: (copy) => <Button onPress={noop}>{copy}</Button>, render: () => <Button onPress={noop}>저장</Button> },
  {
    componentId: "icon-button",
    render: () => <IconButton label="닫기" onPress={noop}><Text>×</Text></IconButton>,
  },
  {
    componentId: "link",
    renderLongCopy: (copy) => <Link descriptor={{ label: copy, destination: { kind: "internal", href: "/docs" } }} onNavigate={noop} />,
    render: () => (
      <Link
        descriptor={{ label: "문서", destination: { kind: "internal", href: "/docs" } }}
        onNavigate={noop}
      />
    ),
  },
  {
    componentId: "bottom-cta",
    renderLongCopy: (copy) => <BottomCTA primaryAction={{ label: copy, onPress: noop }} />,
    render: () => <BottomCTA primaryAction={{ label: "계속", onPress: noop }} />,
  },
  {
    componentId: "field",
    renderLongCopy: (copy) => <Field label={copy}>{(props) => <View {...props} />}</Field>,
    render: () => <Field label="이름">{(props) => <View {...props} />}</Field>,
  },
  {
    componentId: "search-field",
    renderLongCopy: (copy) => <SearchField busyLabel="검색 중" clearLabel="검색어 지우기" label={copy} />,
    render: () => <SearchField busyLabel="검색 중" clearLabel="검색어 지우기" label="검색" />,
  },
  { componentId: "text-area", renderLongCopy: (copy) => <TextArea label={copy} />, render: () => <TextArea label="설명" /> },
  {
    componentId: "password-field",
    renderLongCopy: (copy) => <PasswordField autofillHint="current" concealLabel="비밀번호 숨기기" label={copy} revealLabel="비밀번호 보기" />,
    render: () => (
      <PasswordField
        autofillHint="current"
        concealLabel="비밀번호 숨기기"
        label="비밀번호"
        revealLabel="비밀번호 보기"
      />
    ),
  },
  {
    componentId: "otp-field",
    renderLongCopy: (copy) => <OtpField label={copy} length={6} />,
    render: () => <OtpField label="인증번호" length={6} />,
  },
  {
    componentId: "number-field",
    renderLongCopy: (copy) => <NumberField decrementLabel="감소" incrementLabel="증가" label={copy} min={0} max={10} />,
    render: () => (
      <NumberField
        decrementLabel="감소"
        incrementLabel="증가"
        label="수량"
        min={0}
        max={10}
      />
    ),
  },
  {
    componentId: "slider",
    renderLongCopy: (copy) => <Slider decrementLabel="감소" incrementLabel="증가" label={copy} min={0} max={10} />,
    render: () => (
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        min={0}
        max={10}
      />
    ),
  },
  {
    componentId: "form",
    render: () => (
      <Form
        fallbackErrorMessage="제출 실패"
        label="프로필"
        onSubmit={noop}
        submitLabel="저장"
        values={{ name: "" }}
      >
        <Text>필드</Text>
      </Form>
    ),
  },
  {
    componentId: "date-picker",
    renderLongCopy: (copy) => (
      <DatePicker clearLabel="날짜 지우기" closeLabel="달력 닫기" composeAccessibleName={({ date }) => date}
        descriptor={{ grid: defaultCalendarGrid, displayValue: null, placeholder: "날짜 선택", label: copy, selectedDate: null, onSelectionChange: noop, open: false, onOpenChange: noop }}
        monthLabel="2027년 2월" />
    ),
    render: () => (
      <DatePicker
        clearLabel="날짜 지우기"
        closeLabel="달력 닫기"
        composeAccessibleName={({ date }) => date}
        descriptor={{
          grid: defaultCalendarGrid,
          displayValue: null,
          placeholder: "날짜 선택",
          label: "날짜",
          selectedDate: null,
          onSelectionChange: noop,
          open: false,
          onOpenChange: noop,
        }}
        monthLabel="2027년 2월"
      />
    ),
  },
  {
    componentId: "calendar",
    renderLongCopy: (copy) => <Calendar descriptor={{ grid: defaultCalendarGrid, monthLabel: copy }} composeAccessibleName={({ date }) => date} />,
    render: () => <Calendar descriptor={{ grid: defaultCalendarGrid, monthLabel: "February 2027" }} composeAccessibleName={({ date }) => date} />,
  },
  {
    componentId: "agreement",
    renderLongCopy: (copy) => (
      <Agreement descriptor={{ accessibilityLabel: copy, allLabel: copy, items: [{ id: "terms-long", label: copy, required: true }] }} optionalLabel="(선택)" requiredLabel="(필수)" />
    ),
    render: () => (
      <Agreement
        descriptor={{
          accessibilityLabel: "약관 동의",
          allLabel: "전체 동의하기",
          items: [{ id: "terms", label: "이용약관", required: true, detail: { label: "전문 보기" } }],
        }}
        optionalLabel="(선택)"
        requiredLabel="(필수)"
      />
    ),
  },
  {
    componentId: "top",
    renderLongCopy: (copy) => <Top descriptor={{ title: copy, description: copy }} />,
    render: () => <Top descriptor={{ title: "오늘 기록을 남겨요", description: "짧아도 괜찮아요" }} />,
  },
  {
    componentId: "heading",
    renderLongCopy: (copy) => <Heading level="level2">{copy}</Heading>,
    render: () => <Heading level="level2">기록 모아보기</Heading>,
  },
  {
    componentId: "toggle-group",
    renderLongCopy: (copy) => <ToggleGroup descriptor={{ accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: copy }] }} />,
    render: () => (
      <ToggleGroup descriptor={{ accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: "굵게" }] }} />
    ),
  },
  {
    componentId: "bottom-info",
    renderLongCopy: (copy) => <BottomInfo items={[copy]} />,
    render: () => <BottomInfo items={["가입하면 약관에 동의하는 것으로 봅니다"]} />,
  },
  {
    componentId: "collapsible",
    renderLongCopy: (copy) => <Collapsible trigger={copy} defaultOpen><Text>상세한 배송 안내를 확인해 주세요.</Text></Collapsible>,
    render: () => <Collapsible trigger="배송 정보 더 보기" defaultOpen><Text>내일 도착합니다</Text></Collapsible>,
  },
  {
    componentId: "asset",
    render: () => <Asset descriptor={{ kind: "lottie", accessibilityLabel: "편지를 나르는 동물" }}><View /></Asset>,
  },
  {
    componentId: "tags-input",
    renderLongCopy: (copy) => <TagsInput label={copy} composeRemoveLabel={(tag) => `${tag} 지우기`} defaultTags={["산책"]} />,
    render: () => <TagsInput label="관심사" composeRemoveLabel={(tag) => `${tag} 지우기`} defaultTags={["산책"]} />,
  },
  {
    componentId: "date-range-picker",
    render: () => (
      <DateRangePicker
        descriptor={{ grid: defaultCalendarGrid, monthLabel: "2027년 2월" }}
        composeAccessibleName={({ date }) => date}
        rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
      />
    ),
  },
  {
    componentId: "mentions",
    renderLongCopy: (copy) => (
      <Mentions
        label={copy}
        value=""
        onValueChange={noop}
        triggers={[{ id: "user", trigger: "@" }]}
        candidates={[]}
        emptyMessage="결과가 없어요"
        listLabel="추천 대상"
      />
    ),
    render: () => (
      <Mentions
        accessibilityLabel="메모"
        value=""
        onValueChange={noop}
        triggers={[{ id: "user", trigger: "@" }]}
        candidates={[]}
        emptyMessage="결과가 없어요"
        listLabel="추천 대상"
      />
    ),
  },
  {
    componentId: "transfer-list",
    renderLongCopy: (copy) => (
      <TransferList
        items={[{ id: "long", label: copy, textValue: copy }]}
        labels={{ source: copy, target: "선택됨", toTarget: "선택으로 이동", toSource: "돌아가기", selectAll: "모두 선택", empty: copy }}
      />
    ),
    render: () => (
      <TransferList
        items={[{ id: "walk", label: "산책", textValue: "산책" }, { id: "meal", label: "식사", textValue: "식사" }]}
        labels={{ source: "가능", target: "선택", toTarget: "추가", toSource: "빼기", selectAll: "모두 선택", empty: "없음" }}
      />
    ),
  },
  {
    componentId: "auth-provider-button",
    renderLongCopy: (copy) => <AuthProviderButton descriptor={{ label: copy, provider: "google" }} logo={<View />} onPress={noop} />,
    render: () => (
      <AuthProviderButton
        descriptor={{ label: "Google로 계속하기", provider: "google" }}
        logo={<View />}
        onPress={noop}
      />
    ),
  },
  {
    componentId: "auth-screen",
    renderLongCopy: (copy) => <AuthScreenLayout hero={<Text>{copy}</Text>} main={<Text>로그인</Text>} footer={<Text>약관</Text>} />,
    render: () => (
      <AuthScreenLayout
        hero={<View />}
        main={<View />}
        footer={<View />}
      />
    ),
  },
  {
    componentId: "file-picker",
    renderLongCopy: (copy) => (
      <FilePicker buttonLabel={copy} descriptor={{ mode: "multiple", accept: ["image/*"] }} label={copy} onPick={async () => null} onPickError={noop} onSelect={noop} />
    ),
    render: () => (
      <FilePicker
        buttonLabel="파일 선택"
        descriptor={{ mode: "multiple", accept: ["image/*"] }}
        label="첨부 파일"
        onPick={async () => null}
        onPickError={noop}
        onSelect={noop}
      />
    ),
  },
  { componentId: "checkbox", renderLongCopy: (copy) => <Checkbox label={copy} />, render: () => <Checkbox label="동의" /> },
  { componentId: "radio", renderLongCopy: (copy) => <Radio label={copy} />, render: () => <Radio label="일반 배송" /> },
  {
    componentId: "checkbox-group",
    renderLongCopy: (copy) => <CheckboxGroup label="관심사" items={[{ id: "sports", label: copy }]} />,
    render: () => <CheckboxGroup label="관심사" items={[{ id: "sports", label: "스포츠" }]} />,
  },
  {
    componentId: "radio-group",
    renderLongCopy: (copy) => <RadioGroup label="배송" items={[{ value: "standard", label: copy }]} />,
    render: () => <RadioGroup label="배송" items={[{ value: "standard", label: "일반" }]} />,
  },
  { componentId: "switch", renderLongCopy: (copy) => <Switch label={copy} />, render: () => <Switch label="알림" /> },
  {
    componentId: "segmented-control",
    renderLongCopy: (copy) => <SegmentedControl label="보기" items={[{ value: "list", label: copy }]} />,
    render: () => <SegmentedControl label="보기" items={[{ value: "list", label: "목록" }]} />,
  },
  {
    componentId: "select",
    renderLongCopy: (copy) => (
      <Select defaultSelectedKey="ko" dismissLabel="닫기" label={copy} items={[{ id: "ko", label: "한국어" , textValue: "한국어"}]} placeholder="선택" />
    ),
    render: () => (
      <Select
        dismissLabel="닫기"
        label="언어"
        items={[{ id: "ko", label: "한국어" , textValue: "한국어"}]}
        placeholder="선택"
      />
    ),
  },
  {
    componentId: "combobox",
    renderLongCopy: (copy) => (
      <Combobox clearLabel="검색어 지우기" dismissLabel="닫기" emptyMessage="결과 없음" items={[{ id: "seoul", label: "서울", textValue: "서울" }]} label={copy} loadingMessage="검색 중" />
    ),
    render: () => (
      <Combobox
        clearLabel="검색어 지우기"
        dismissLabel="닫기"
        emptyMessage="결과 없음"
        items={[{ id: "seoul", label: "서울", textValue: "서울" }]}
        label="도시"
        loadingMessage="검색 중"
      />
    ),
  },
  { componentId: "chip", renderLongCopy: (copy) => <Chip label={copy} onPress={noop} />, render: () => <Chip label="필터" onPress={noop} /> },
  {
    componentId: "tabs",
    renderLongCopy: (copy) => (
      <Tabs label="계정" items={[{ id: "profile", label: copy }, { id: "settings", label: "설정" }]} />
    ),
    render: () => <Tabs label="계정" items={[{ id: "profile", label: "프로필" }]} />,
  },
  {
    componentId: "carousel",
    renderLongCopy: (copy) => <Carousel label={copy} slides={[{ id: "one", label: copy }, { id: "two", label: "다음 소식" }]}
      labels={{ previous: copy, next: copy, pause: copy, resume: copy, navigation: copy }}
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      renderSlide={({ label }) => <Text>{label}</Text>} />,
    render: () => <Carousel label="새 소식" slides={[{ id: "one", label: "첫 소식" }, { id: "two", label: "다음 소식" }]}
      labels={{ previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" }}
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      renderSlide={({ label }) => <Text>{label}</Text>} />,
  },
  {
    componentId: "floating-action-button",
    renderLongCopy: (copy) => <FloatingActionButton descriptor={{ label: copy, icon: { name: "add" } }} renderIcon={() => <Text>＋</Text>} onContentClearanceChange={() => {}} />,
    render: () => <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }}
      renderIcon={() => <Text>＋</Text>} onContentClearanceChange={() => {}} />,
  },
  {
    componentId: "steps",
    renderLongCopy: (copy) => <Steps composeAccessibleName={({ position, total, label }) => `${total}단계 중 ${position}단계, ${label}`} descriptor={{ steps: [{ id: "one", label: copy }, { id: "two", label: "확인" }], currentStepId: "one" }} statusLabels={{ pending: "예정", current: "현재", complete: "완료", error: "오류" }} />,
    render: () => (
      <Steps
        composeAccessibleName={({ position, total, label }) => `${total}단계 중 ${position}단계, ${label}`}
        descriptor={{ steps: [{ id: "account", label: "계정" }, { id: "profile", label: "프로필" }], currentStepId: "profile" }}
        statusLabels={{ pending: "예정", current: "현재", complete: "완료", error: "오류" }}
      />
    ),
  },
  {
    componentId: "top-bar",
    renderLongCopy: (copy) => <TopBar title={copy} />,
    render: () => (
      <TopBar
        actions={(
          <TopBarAction label="공유" onPress={noop}>
            <View testID="share-icon" />
          </TopBarAction>
        )}
        onTitlePress={noop}
        title="설정"
        titleLeading={<View testID="settings-avatar" />}
      />
    ),
  },
  {
    componentId: "menu",
    renderLongCopy: (copy) => (
      <Menu dismissLabel="닫기" items={[{ id: "edit", label: copy }]} onAction={noop} triggerLabel="더 보기" />
    ),
    render: () => (
      <Menu
        dismissLabel="닫기"
        items={[{ id: "edit", label: "수정" }]}
        onAction={noop}
        triggerLabel="더 보기"
      />
    ),
  },
  { componentId: "badge", renderLongCopy: (copy) => <Badge label={copy} />, render: () => <Badge label="새 항목" /> },
  {
    componentId: "avatar",
    render: () => <Avatar accessibilityLabel="Ada Lovelace" name="Ada Lovelace" />,
  },
  { componentId: "card", renderLongCopy: (copy) => <Card><Text>{copy}</Text></Card>, render: () => <Card><Text>카드</Text></Card> },
  { componentId: "list-row", renderLongCopy: (copy) => <ListRow title={copy} />, render: () => <ListRow title="행" /> },
  { componentId: "tag", renderLongCopy: (copy) => <Tag>{copy}</Tag>, render: () => <Tag>태그</Tag> },
  {
    componentId: "timeline",
    renderLongCopy: (copy) => <Timeline composeAccessibleName={({ position, total, label }) => `${total}개 중 ${position}번째, ${label}`} items={[{ id: "created", label: copy }]} />,
    render: () => (
      <Timeline
        composeAccessibleName={({ position, total, label }) =>
          `${total}개 중 ${position}번째, ${label}`
        }
        items={[{ id: "created", label: "생성" }]}
      />
    ),
  },
  {
    componentId: "description-list",
    renderLongCopy: (copy) => <DescriptionList availableWidth={320} label="상세 정보" descriptor={{ items: [{ id: "status", label: "상태", value: copy }] }} />,
    render: () => (
      <DescriptionList
        availableWidth={320}
        label="상세 정보"
        descriptor={{ items: [{ id: "status", label: "상태", value: "준비" }] }}
      />
    ),
  },
  {
    componentId: "image",
    render: () => (
      <Image
        src="https://example.com/image.png"
        width={320}
        height={180}
      />
    ),
  },
  {
    componentId: "counter-badge",
    render: () => <CounterBadge accessibilityLabel="알림 3개" count={3} />,
  },
  { componentId: "list", renderLongCopy: (copy) => <List label="목록"><ListRow title={copy} /></List>, render: () => <List label="목록"><ListRow title="행" /></List> },
  {
    componentId: "statistic",
    renderLongCopy: (copy) => <Statistic descriptor={{ id: "orders", label: copy, value: "12" }} />,
    render: () => <Statistic descriptor={{ id: "orders", label: "주문", value: "12" }} />,
  },
  {
    componentId: "upload-item",
    renderLongCopy: (copy) => (
      <UploadItem
        descriptor={{ id: "photo", name: copy, sizeLabel: copy, state: { status: "uploading", progress: 0.4, progressLabel: copy } }}
        labels={{ pending: "대기", uploading: copy, success: "완료", cancel: "취소", retry: "재시도" }}
        onCancel={noop}
      />
    ),
    render: () => (
      <UploadItem
        descriptor={{ id: "photo", name: "photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.4 } }}
        labels={{ pending: "대기", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "재시도" }}
        onCancel={noop}
      />
    ),
  },
  { componentId: "empty-state", renderLongCopy: (copy) => <EmptyState title={copy} />, render: () => <EmptyState title="항목 없음" /> },
  { componentId: "result", renderLongCopy: (copy) => <Result status="success" title={copy} />, render: () => <Result status="success" title="저장됨" /> },
  { componentId: "notice", renderLongCopy: (copy) => <Notice title={copy} />, render: () => <Notice title="안내" /> },
  { componentId: "progress", renderLongCopy: (copy) => <Progress label={copy} value={0.5} />, render: () => <Progress label="업로드" value={0.5} /> },
  { componentId: "skeleton", render: () => <Skeleton accessibilityLabel="불러오는 중" /> },
  { componentId: "thinking-orb", render: () => <ThinkingOrb label="검색 중" paused /> },
  { componentId: "masonry", renderLongCopy: (copy) => <Masonry items={[copy]} keyExtractor={item => item} label="Cards" width={240} columns={1} getItemHeight={() => 300} renderItem={item => <Text>{item}</Text>} />, render: () => <Masonry items={["First", "Second"]} keyExtractor={item => item} label="Cards" width={240} getItemHeight={() => 120} renderItem={item => <Text>{item}</Text>} /> },
  { componentId: "virtual-list", renderLongCopy: (copy) => <VirtualList items={[copy]} keyExtractor={item => item} label="Items" height={300} rowHeight={300} renderItem={item => <Text>{item}</Text>} />, render: () => <VirtualList items={["First", "Second"]} keyExtractor={item => item} label="Items" height={200} rowHeight={100} renderItem={item => <Text>{item}</Text>} /> },
  { componentId: "qr-code", renderLongCopy: (copy) => <QRCode value="https://example.com" label="Share code" fallback={<Text>{copy}</Text>} />, render: () => <QRCode value="https://example.com" label="Share code" fallback={<Text>Open destination</Text>} /> },
  { componentId: "spinner", render: () => <Spinner label="불러오는 중" /> },
  {
    componentId: "dialog",
    renderLongCopy: (copy) => <Dialog closeLabel="닫기" defaultOpen description={copy} title={copy} />,
    render: () => <Dialog closeLabel="닫기" defaultOpen description="설정을 변경합니다." title="대화상자" />,
  },
  {
    componentId: "alert-dialog",
    renderLongCopy: (copy) => (
      <AlertDialog
        defaultOpen
        request={{ mode: "alert", title: copy, description: copy, confirmLabel: "확인" }}
      />
    ),
    render: () => (
      <AlertDialog
        request={{
          mode: "alert",
          title: "알림",
          description: "확인해 주세요.",
          confirmLabel: "확인",
        }}
      />
    ),
  },
  { componentId: "sheet", render: () => <Sheet closeLabel="닫기" title="시트" /> },
  {
    componentId: "bottom-navigation",
    renderLongCopy: (copy) => (
      <BottomNavigation
        descriptor={{ accessibilityLabel: "주요 메뉴", items: [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "search", label: copy, icon: { name: "search" } }], selectedKey: "home" }}
        onActivate={noop}
        renderIcon={({ name }) => <Text>{name}</Text>}
      />
    ),
    render: () => (
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "주요 메뉴",
          items: [
            { id: "home", label: "홈", icon: { name: "home" } },
            { id: "profile", label: "프로필", icon: { name: "user" } },
          ],
          selectedKey: "home",
        }}
        onActivate={noop}
        renderIcon={({ name }) => <Text>{name}</Text>}
      />
    ),
  },
  {
    componentId: "load-more",
    renderLongCopy: (copy) => (
      <LoadMore descriptor={{ state: { status: "complete" }, labels: { complete: copy, loadMore: copy, loading: copy, retry: copy } }} mode="manual" onLoadMore={async () => undefined} />
    ),
    render: () => (
      <LoadMore
        descriptor={{
          labels: {
            complete: "모두 불러옴",
            loading: "불러오는 중",
            loadMore: "더 보기",
            retry: "다시 시도",
          },
          state: { status: "ready", requestKey: "default-page" },
        }}
        mode="manual"
        onLoadMore={async () => undefined}
      />
    ),
  },
  {
    componentId: "accordion",
    renderLongCopy: (copy) => (
      <Accordion label={copy} items={[{ value: "long-copy", title: copy, accessibilityLabel: copy, content: <Text>{copy}</Text> }]} />
    ),
    render: () => (
      <Accordion
        label="도움말"
        items={[{ value: "shipping", title: "배송", content: <Text>내일 도착</Text> }]}
      />
    ),
  },
  { componentId: "divider", render: () => <Divider /> },
  {
    componentId: "toast",
    renderLongCopy: (copy) => <ToastRegion defaultToasts={[{ id: "long", description: copy, durationMs: null, closeLabel: "알림 닫기" }]} />,
    render: () => (
      <ToastRegion
        defaultToasts={[{
          id: "ready",
          description: "준비됨",
          durationMs: null,
          closeLabel: "알림 닫기",
        }]}
      />
    ),
  },
] as const satisfies readonly DefaultRenderCase[];
