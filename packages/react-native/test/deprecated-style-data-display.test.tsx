import type { ComponentProps, ReactElement } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Text as NativeText, View } from "react-native";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  Accordion,
  Avatar,
  Badge,
  CounterBadge,
  DescriptionList,
  Divider,
  HjmNativeProvider,
  List,
  ListRow,
  Statistic,
  StatisticGroup,
  Tag,
  Timeline,
  useHjmNativeTheme,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode): ReactTestRenderer {
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

const marker = { marginTop: 37 } as const;

function hasMarker(renderer: ReactTestRenderer): boolean {
  return renderer.root
    .findAll((node: ReactTestInstance) => node.type === View || node.type === NativeText)
    .some((node) => flattenStyle(node.props.style).marginTop === 37);
}

type Case = Readonly<{
  component: string;
  /** Untyped callers exercise removal while canonical placement stays supported. */
  deprecated: Readonly<Record<string, unknown>>;
  build: (extra: Readonly<Record<string, unknown>>) => ReactElement;
}>;

const paint = { backgroundColor: "red" };
const textPaint = { color: "red" };

const cases: readonly Case[] = [
  {
    component: "Badge",
    deprecated: { style: paint, labelStyle: textPaint },
    build: (extra) => <Badge label="New" {...extra} />,
  },
  {
    component: "Tag",
    deprecated: { style: paint, labelStyle: textPaint },
    build: (extra) => <Tag {...extra}>Tag</Tag>,
  },
  {
    component: "ListRow",
    deprecated: { titleStyle: textPaint, descriptionStyle: textPaint },
    build: (extra) => <ListRow title="Row" description="Detail" {...extra} />,
  },
  {
    component: "Avatar",
    deprecated: { style: paint, imageStyle: paint },
    build: (extra) => <Avatar decorative name="Ji Min" {...extra} />,
  },
  {
    component: "Divider",
    deprecated: { style: paint },
    build: (extra) => <Divider {...extra} />,
  },
  {
    component: "Accordion",
    deprecated: {
      style: paint,
      itemStyle: paint,
      triggerStyle: paint,
      titleStyle: textPaint,
      indicatorStyle: paint,
      panelStyle: paint,
    },
    build: (extra) => (
      <Accordion
        defaultExpandedValues={["a"]}
        items={[{ value: "a", title: "A", content: <View /> }]}
        label="FAQ"
        {...extra}
      />
    ),
  },
  {
    component: "DescriptionList",
    deprecated: { style: paint, itemStyle: paint },
    build: (extra) => (
      <DescriptionList
        availableWidth={320}
        descriptor={{ items: [{ id: "a", label: "Name", value: "Jimin" }] }}
        label="Profile"
        {...extra}
      />
    ),
  },
  {
    component: "CounterBadge",
    deprecated: { style: paint },
    build: (extra) => <CounterBadge count={3} {...extra} />,
  },
  {
    component: "List",
    deprecated: { style: paint },
    build: (extra) => <List label="Items" {...extra}><View /></List>,
  },
  {
    component: "Statistic",
    deprecated: {
      style: paint,
      labelStyle: textPaint,
      valueStyle: textPaint,
      affixStyle: textPaint,
      trendStyle: textPaint,
      hintStyle: textPaint,
    },
    build: (extra) => (
      <Statistic
        descriptor={{
          id: "s",
          label: "Users",
          value: "10",
          prefix: "$",
          hint: "today",
          trend: { direction: "up", tone: "success", label: "+1" },
        }}
        {...extra}
      />
    ),
  },
  {
    component: "StatisticGroup",
    deprecated: { style: paint, itemStyle: paint },
    build: (extra) => (
      <StatisticGroup
        availableWidth={320}
        descriptor={{ items: [{ id: "s", label: "Users", value: "10" }] }}
        label="Stats"
        {...extra}
      />
    ),
  },
  {
    component: "Timeline",
    deprecated: { style: paint },
    build: (extra) => (
      <Timeline
        composeAccessibleName={({ label }) => label}
        items={[{ id: "t", label: "Created", timestamp: "Today" }]}
        {...extra}
      />
    ),
  },
];

describe("data-display removed visual style props", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it.each(cases)("$component no longer applies removed visual styles", ({ component, deprecated, build }) => {
    if (!["Avatar", "Divider", "Accordion", "CounterBadge", "Statistic"].includes(component)) {
      expect(() => render(build(deprecated))).toThrow(/were removed/);
      return;
    }
    const renderer = render(build(deprecated));
    expect(renderer.root.findAll(node => typeof node.type === "string").some(node => {
      const style = flattenStyle(node.props.style);
      return style.backgroundColor === "red" || style.color === "red";
    })).toBe(false);
    act(() => renderer.unmount());
  });

  it("removes visual keys from exported props", () => {
    expectTypeOf<Extract<keyof ComponentProps<typeof Badge>, "style" | "labelStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof ListRow>, "titleStyle" | "descriptionStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof Avatar>, "style" | "imageStyle">>().toEqualTypeOf<never>();
  });

  it("uses semantic danger emphasis without changing selection or activation", () => {
    const press = vi.fn();
    let dangerColor: string | undefined;
    function ThemeColor() { dangerColor = useHjmNativeTheme().colors.danger; return null; }
    const renderer = render(<><ThemeColor /><ListRow title="Delete account" tone="danger" selected onPress={press} /></>);
    const title = renderer.root.findAllByType(NativeText).find(node => node.props.children === "Delete account")!;
    expect(flattenStyle(title.props.style).color).toBe(dangerColor);
    const row = renderer.root.findAll(node => typeof node.type === "string" && node.props.accessibilityRole === "button")[0]!;
    expect(row.props.accessibilityState.selected).toBe(true);
    act(() => row.props.onPress());
    expect(press).toHaveBeenCalledOnce();
    act(() => renderer.unmount());
  });

  it.each(cases)("$component accepts layoutStyle on the root without warning", ({ build }) => {
    const renderer = render(build({ layoutStyle: marker }));
    expect(warn).not.toHaveBeenCalled();
    expect(hasMarker(renderer)).toBe(true);
    act(() => renderer.unmount());
  });

  it("keeps StatisticGroup item widths through canonical placement", () => {
    const renderer = render(
      <StatisticGroup
        availableWidth={320}
        descriptor={{ items: [{ id: "a", label: "A", value: "1" }, { id: "b", label: "B", value: "2" }] }}
        label="Stats"
      />,
    );
    expect(warn).not.toHaveBeenCalled();
    const widths = renderer.root
      .findAll((node: ReactTestInstance) => node.type === View && node.props.accessible === true)
      .map((node) => flattenStyle(node.props.style).width)
      .filter((width) => typeof width === "number");
    expect(widths.length).toBeGreaterThanOrEqual(2);
    act(() => renderer.unmount());
  });
});
