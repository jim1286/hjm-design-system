import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AlertDialog,
  Badge,
  BottomCTA,
  BottomNavigation,
  Button,
  Card,
  Chip,
  CounterBadge,
  Dialog,
  Divider,
  EmptyState,
  Field,
  Grid,
  HjmNativeProvider,
  Icon,
  IconButton,
  List,
  ListRow,
  Notice,
  Progress,
  RadioGroup,
  SearchField,
  Section,
  SegmentedControl,
  Sheet,
  Skeleton,
  Stack,
  Statistic,
  Surface,
  Switch,
  Tabs,
  Tag,
  Text,
  TextArea,
  ToastRegion,
  TopBar,
} from "../src/index.js";
import { reactNativeRendererEvidence } from "../src/evidence.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type DefaultRenderCase = Readonly<{
  componentId: string;
  render: () => ReactNode;
}>;

const noop = () => undefined;

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
    componentId: "radio-group",
    render: () => <RadioGroup label="배송" options={[{ value: "standard", label: "일반" }]} />,
  },
  { componentId: "switch", render: () => <Switch label="알림" /> },
  {
    componentId: "segmented-control",
    render: () => <SegmentedControl label="보기" options={[{ value: "list", label: "목록" }]} />,
  },
  { componentId: "chip", render: () => <Chip label="필터" onPress={noop} /> },
  {
    componentId: "tabs",
    render: () => <Tabs label="계정" options={[{ value: "profile", label: "프로필" }]} />,
  },
  { componentId: "top-bar", render: () => <TopBar title="설정" /> },
  { componentId: "badge", render: () => <Badge label="새 항목" /> },
  { componentId: "card", render: () => <Card><Text>카드</Text></Card> },
  { componentId: "list-row", render: () => <ListRow title="행" /> },
  { componentId: "tag", render: () => <Tag>태그</Tag> },
  {
    componentId: "counter-badge",
    render: () => <CounterBadge accessibilityLabel="알림 3개" count={3} />,
  },
  { componentId: "list", render: () => <List label="목록"><ListRow title="행" /></List> },
  {
    componentId: "statistic",
    render: () => <Statistic descriptor={{ id: "orders", label: "주문", value: "12" }} />,
  },
  { componentId: "empty-state", render: () => <EmptyState title="항목 없음" /> },
  { componentId: "notice", render: () => <Notice title="안내" /> },
  { componentId: "progress", render: () => <Progress label="업로드" value={0.5} /> },
  { componentId: "skeleton", render: () => <Skeleton accessibilityLabel="불러오는 중" /> },
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
  });

  it.each(defaultRenderCases)("$componentId", ({ render: renderCase }) => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider reducedMotion theme="light">
          {renderCase()}
        </HjmNativeProvider>,
        { createNodeMock: () => ({}) },
      );
    });
    expect(renderer?.root).toBeDefined();
    act(() => { renderer?.unmount(); });
  });
});
