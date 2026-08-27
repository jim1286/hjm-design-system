import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AlertDialog,
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
  CounterBadge,
  DatePicker,
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
import { reactNativeRendererEvidence } from "../src/evidence.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type DefaultRenderCase = Readonly<{
  componentId: string;
  render: () => ReactNode;
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

const rendererEnvironments = executedScenarioRegistry.executions[0]!.scenarios as readonly Readonly<{
  id: "default" | "dark" | "long-copy" | "large-text" | "rtl" | "reduced-motion" | "accessibility";
  theme: "light" | "dark";
  direction: "ltr" | "rtl";
  textScale: number;
  reducedMotion: boolean;
}>[];

const longCopy = "아주 긴 제품 설명과 unexpectedly long English content must wrap without hiding the component meaning or required action.";

/** Literal case ids are consumed by the fail-closed evidence checker. */
export const defaultRenderCases = [
  {
    componentId: "design-system-provider",
    render: () => <HjmNativeProvider reducedMotion><Text>중첩 공급자</Text></HjmNativeProvider>,
  },
  { componentId: "text", render: () => <Text>본문</Text> },
  { componentId: "surface", render: () => <Surface><Text>표면</Text></Surface> },
  { componentId: "stack", render: () => <Stack><Text>스택</Text></Stack> },
  {
    componentId: "grid",
    render: () => (
      <Grid availableWidth={320} columns={{ compact: 2 }}>
        <Text key="first">첫 번째</Text>
        <Text key="second">두 번째</Text>
      </Grid>
    ),
  },
  { componentId: "layout", render: () => <Layout><Text>본문</Text></Layout> },
  {
    componentId: "icon",
    render: () => (
      <Icon
        descriptor={{ name: "check", decorative: true }}
        renderGlyph={({ name }) => <Text>{name}</Text>}
      />
    ),
  },
  { componentId: "section", render: () => <Section title="섹션"><Text>내용</Text></Section> },
  { componentId: "button", render: () => <Button onPress={noop}>저장</Button> },
  {
    componentId: "icon-button",
    render: () => <IconButton label="닫기" onPress={noop}><Text>×</Text></IconButton>,
  },
  {
    componentId: "link",
    render: () => (
      <Link
        descriptor={{ label: "문서", destination: { kind: "internal", href: "/docs" } }}
        onNavigate={noop}
      />
    ),
  },
  {
    componentId: "bottom-cta",
    render: () => <BottomCTA primaryAction={{ label: "계속", onPress: noop }} />,
  },
  {
    componentId: "field",
    render: () => <Field label="이름">{(props) => <View {...props} />}</Field>,
  },
  {
    componentId: "search-field",
    render: () => <SearchField busyLabel="검색 중" clearLabel="검색어 지우기" label="검색" />,
  },
  { componentId: "text-area", render: () => <TextArea label="설명" /> },
  {
    componentId: "password-field",
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
    render: () => <OtpField label="인증번호" length={6} />,
  },
  {
    componentId: "number-field",
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
    componentId: "file-picker",
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
  { componentId: "checkbox", render: () => <Checkbox label="동의" /> },
  { componentId: "radio", render: () => <Radio label="일반 배송" /> },
  {
    componentId: "checkbox-group",
    render: () => <CheckboxGroup label="관심사" items={[{ id: "sports", label: "스포츠" }]} />,
  },
  {
    componentId: "radio-group",
    render: () => <RadioGroup label="배송" options={[{ value: "standard", label: "일반" }]} />,
  },
  { componentId: "switch", render: () => <Switch label="알림" /> },
  {
    componentId: "segmented-control",
    render: () => <SegmentedControl label="보기" options={[{ value: "list", label: "목록" }]} />,
  },
  {
    componentId: "select",
    render: () => (
      <Select
        dismissLabel="닫기"
        label="언어"
        options={[{ value: "ko", label: "한국어" }]}
        placeholder="선택"
      />
    ),
  },
  {
    componentId: "combobox",
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
  { componentId: "chip", render: () => <Chip label="필터" onPress={noop} /> },
  {
    componentId: "tabs",
    render: () => <Tabs label="계정" options={[{ value: "profile", label: "프로필" }]} />,
  },
  {
    componentId: "steps",
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
    render: () => (
      <Menu
        dismissLabel="닫기"
        items={[{ value: "edit", label: "수정" }]}
        onSelect={noop}
        triggerLabel="더 보기"
      />
    ),
  },
  { componentId: "badge", render: () => <Badge label="새 항목" /> },
  {
    componentId: "avatar",
    render: () => <Avatar accessibilityLabel="Ada Lovelace" name="Ada Lovelace" />,
  },
  { componentId: "card", render: () => <Card><Text>카드</Text></Card> },
  { componentId: "list-row", render: () => <ListRow title="행" /> },
  { componentId: "tag", render: () => <Tag>태그</Tag> },
  {
    componentId: "timeline",
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
  { componentId: "list", render: () => <List label="목록"><ListRow title="행" /></List> },
  {
    componentId: "statistic",
    render: () => <Statistic descriptor={{ id: "orders", label: "주문", value: "12" }} />,
  },
  {
    componentId: "upload-item",
    render: () => (
      <UploadItem
        descriptor={{ id: "photo", name: "photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.4 } }}
        labels={{ pending: "대기", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "재시도" }}
        onCancel={noop}
      />
    ),
  },
  { componentId: "empty-state", render: () => <EmptyState title="항목 없음" /> },
  { componentId: "result", render: () => <Result status="success" title="저장됨" /> },
  { componentId: "notice", render: () => <Notice title="안내" /> },
  { componentId: "progress", render: () => <Progress label="업로드" value={0.5} /> },
  { componentId: "skeleton", render: () => <Skeleton accessibilityLabel="불러오는 중" /> },
  { componentId: "spinner", render: () => <Spinner label="불러오는 중" /> },
  { componentId: "dialog", render: () => <Dialog closeLabel="닫기" title="대화상자" /> },
  {
    componentId: "alert-dialog",
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

describe("@hjm/react-native default renderer evidence", () => {
  it("has one literal executable case for every default evidence claim", () => {
    const evidenceIds = reactNativeRendererEvidence.components.map(({ componentId }) => componentId);
    const caseIds = defaultRenderCases.map(({ componentId }) => componentId);
    expect(caseIds).toEqual(evidenceIds);
    expect(new Set(caseIds).size).toBe(caseIds.length);
    expect(executedScenarioRegistry.executions[0]?.coverageMode).toBe("all-cases");
    expect(executedScenarioRegistry.executions[0]?.proofFile).toBe("test/default-render.test.tsx");
    expect(rendererEnvironments.map(({ id }) => id)).toEqual(reactNativeRendererEvidence.components[0]?.scenarios);
  });

  it.each(defaultRenderCases)("$componentId", ({ render: renderCase }) => {
    for (const environment of rendererEnvironments) {
      let renderer: ReactTestRenderer | undefined;
      act(() => {
        renderer = create(
          <HjmNativeProvider
            direction={environment.direction}
            reducedMotion={environment.reducedMotion}
            textScale={environment.textScale}
            theme={environment.theme}
          >
            <View accessibilityLabel={environment.id === "long-copy" ? longCopy : undefined} style={{ maxWidth: 320 }}>
              {renderCase()}
            </View>
          </HjmNativeProvider>,
          { createNodeMock: () => ({}) },
        );
      });
      expect(renderer?.root).toBeDefined();
      const serialized = JSON.stringify(renderer?.toJSON());
      if (environment.id === "accessibility") {
        expect(serialized).not.toContain('"accessibilityLabel":""');
      }
      if (environment.id === "long-copy") expect(serialized).toContain(longCopy);
      act(() => { renderer?.unmount(); });
    }
  });
});
