import type { ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Text, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BottomNavigation,
  HjmNativeProvider,
  Menu,
  TabPanel,
  Tabs,
  TopBar,
  TopBarAction,
} from "../src/index.js";
import { resetDeprecatedStyleWarningsForTest } from "../src/internal/deprecated-style.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        {node}
      </HjmNativeProvider>,
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (typeof style === "function") return flattenStyle(style({ pressed: false }));
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

/** The layout marker only a caller's layoutStyle would put on a host node. */
const placement = { marginTop: 37 } as const;

function hasPlacement(renderer: ReactTestRenderer): boolean {
  return renderer.root
    .findAll((node: ReactTestInstance) => typeof node.type === "string" || node.props.style !== undefined)
    .some((node) => flattenStyle(node.props.style).marginTop === 37);
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  resetDeprecatedStyleWarningsForTest();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function warnedFor(key: string): number {
  return warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes(`${key} is deprecated`)).length;
}

const bottomDescriptor = {
  accessibilityLabel: "주요 탐색",
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    { id: "search", label: "검색", icon: { name: "search" } },
  ],
  selectedKey: "home",
} as const;

const tabItems = [
  { id: "profile", label: "프로필", panel: <Text>프로필 패널</Text> },
  { id: "details", label: "상세", panel: <Text>상세 패널</Text> },
] as const;

type Case = Readonly<{
  name: string;
  props: readonly string[];
  deprecated: () => ReactNode;
  layoutOnly: () => ReactNode;
}>;

const cases: readonly Case[] = [
  {
    name: "Tabs",
    props: ["style", "tabListStyle"],
    deprecated: () => (
      <Tabs id="t" items={tabItems} label="계정" style={{ opacity: 0.5 }} tabListStyle={{ opacity: 0.5 }} />
    ),
    layoutOnly: () => <Tabs id="t" items={tabItems} label="계정" layoutStyle={placement} />,
  },
  {
    name: "TabPanel",
    props: ["style"],
    deprecated: () => (
      <TabPanel activeValue="a" label="패널" style={{ opacity: 0.5 }} tabsId="t" value="a">
        <Text>내용</Text>
      </TabPanel>
    ),
    layoutOnly: () => (
      <TabPanel activeValue="a" label="패널" layoutStyle={placement} tabsId="t" value="a">
        <Text>내용</Text>
      </TabPanel>
    ),
  },
  {
    name: "BottomNavigation",
    props: ["style", "surfaceStyle", "listStyle", "primaryActionStyle"],
    deprecated: () => (
      <BottomNavigation
        descriptor={bottomDescriptor}
        listStyle={{ opacity: 0.5 }}
        onActivate={() => undefined}
        primaryAction={<View />}
        primaryActionStyle={{ opacity: 0.5 }}
        renderIcon={() => null}
        style={{ opacity: 0.5 }}
        surfaceStyle={{ opacity: 0.5 }}
      />
    ),
    layoutOnly: () => (
      <BottomNavigation
        descriptor={bottomDescriptor}
        layoutStyle={placement}
        onActivate={() => undefined}
        renderIcon={() => null}
      />
    ),
  },
  {
    name: "TopBar",
    props: ["style", "leadingStyle", "titleStyle", "trailingStyle"],
    deprecated: () => (
      <TopBar
        leading={<View />}
        leadingStyle={{ opacity: 0.5 }}
        style={{ opacity: 0.5 }}
        title="제목"
        titleStyle={{ opacity: 0.5 }}
        trailing={<View />}
        trailingStyle={{ opacity: 0.5 }}
      />
    ),
    layoutOnly: () => <TopBar layoutStyle={placement} title="제목" />,
  },
  {
    name: "TopBarAction",
    props: ["style", "labelStyle"],
    deprecated: () => (
      <TopBarAction label="필터" labelStyle={{ opacity: 0.5 }} onPress={() => undefined} style={{ opacity: 0.5 }}>
        <View />
      </TopBarAction>
    ),
    layoutOnly: () => (
      <TopBarAction label="필터" layoutStyle={placement} onPress={() => undefined}>
        <View />
      </TopBarAction>
    ),
  },
  {
    name: "Menu",
    props: ["style"],
    deprecated: () => (
      <Menu dismissLabel="닫기" items={[{ id: "edit", label: "편집" }]} style={{ opacity: 0.5 }} triggerLabel="메뉴" />
    ),
    layoutOnly: () => (
      <Menu dismissLabel="닫기" items={[{ id: "edit", label: "편집" }]} layoutStyle={placement} triggerLabel="메뉴" />
    ),
  },
];

describe("Native navigation deprecated visual style props", () => {
  for (const testCase of cases) {
    it(`${testCase.name} warns once per deprecated prop and keeps the legacy style working`, () => {
      const first = render(testCase.deprecated());
      act(() => first.update(
        <HjmNativeProvider reducedMotion theme="light">{testCase.deprecated()}</HjmNativeProvider>,
      ));
      const second = render(testCase.deprecated());
      for (const prop of testCase.props) {
        expect(warnedFor(`${testCase.name}.${prop}`), `${testCase.name}.${prop}`).toBe(1);
      }
      act(() => {
        first.unmount();
        second.unmount();
      });
    });

    it(`${testCase.name} accepts layoutStyle on the root without warning`, () => {
      const renderer = render(testCase.layoutOnly());
      expect(warn).not.toHaveBeenCalled();
      expect(hasPlacement(renderer)).toBe(true);
      act(() => renderer.unmount());
    });
  }
});
