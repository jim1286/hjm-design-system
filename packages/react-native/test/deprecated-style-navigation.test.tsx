import { cloneElement, type ReactElement, type ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Text, View } from "react-native";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  BottomNavigation,
  HjmNativeProvider,
  Menu,
  TabPanel,
  Tabs,
  TopBar,
  TopBarAction,
  type TabsProps, type TabPanelProps, type BottomNavigationProps, type TopBarProps, type TopBarActionProps, type MenuProps,
} from "../src/index.js";

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
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

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
  layoutOnly: () => ReactNode;
}>;

const cases: readonly Case[] = [
  {
    name: "Tabs",
    props: ["style", "tabListStyle"],
    layoutOnly: () => <Tabs id="t" items={tabItems} label="계정" layoutStyle={placement} />,
  },
  {
    name: "TabPanel",
    props: ["style"],
    layoutOnly: () => (
      <TabPanel activeValue="a" label="패널" layoutStyle={placement} tabsId="t" value="a">
        <Text>내용</Text>
      </TabPanel>
    ),
  },
  {
    name: "BottomNavigation",
    props: ["style", "surfaceStyle", "listStyle", "primaryActionStyle"],
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
    layoutOnly: () => <TopBar layoutStyle={placement} title="제목" />,
  },
  {
    name: "TopBarAction",
    props: ["style", "labelStyle"],
    layoutOnly: () => (
      <TopBarAction label="필터" layoutStyle={placement} onPress={() => undefined}>
        <View />
      </TopBarAction>
    ),
  },
  {
    name: "Menu",
    props: ["style"],
    layoutOnly: () => (
      <Menu dismissLabel="닫기" items={[{ id: "edit", label: "편집" }]} layoutStyle={placement} triggerLabel="메뉴" />
    ),
  },
];

describe("Native navigation canonical style boundary", () => {
  for (const testCase of cases) {
    for (const prop of testCase.props) {
      it(`${testCase.name} rejects removed ${prop} from untyped callers`, () => {
        const node = testCase.layoutOnly() as ReactElement<Record<string, unknown>>;
        expect(() => render(cloneElement(node, { [prop]: { opacity: 0.5 } }))).toThrow(TypeError);
      });
    }
    it(`${testCase.name} applies layoutStyle without overriding the recipe`, () => {
      const renderer = render(testCase.layoutOnly());
      expect(warn).not.toHaveBeenCalled();
      expect(hasPlacement(renderer)).toBe(true);
      act(() => renderer.unmount());
    });
  }
});

it("excludes removed navigation visual overrides from public types", () => {
  expectTypeOf<Extract<keyof TabsProps, "style" | "tabListStyle">>().toEqualTypeOf<never>();
  expectTypeOf<TabPanelProps>().not.toHaveProperty("style");
  expectTypeOf<Extract<keyof BottomNavigationProps, "style" | "surfaceStyle" | "listStyle" | "primaryActionStyle">>().toEqualTypeOf<never>();
  expectTypeOf<Extract<keyof TopBarProps, "style" | "leadingStyle" | "titleStyle" | "trailingStyle">>().toEqualTypeOf<never>();
  expectTypeOf<Extract<keyof TopBarActionProps, "style" | "labelStyle">>().toEqualTypeOf<never>();
  expectTypeOf<MenuProps>().not.toHaveProperty("style");
});
