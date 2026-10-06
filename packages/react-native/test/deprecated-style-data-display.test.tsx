import type { ReactElement } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Text as NativeText, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
} from "../src/index.js";
import { resetDeprecatedStyleWarningsForTest } from "../src/internal/deprecated-style.js";

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
  /** Deprecated props passed together; every name must warn exactly once. */
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
    deprecated: { style: paint },
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

describe("data-display deprecated visual style props", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetDeprecatedStyleWarningsForTest();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it.each(cases)("$component warns once per deprecated prop and keeps rendering it", ({ component, deprecated, build }) => {
    const first = render(build(deprecated));
    act(() => first.update(
      <HjmNativeProvider reducedMotion theme="light">{build(deprecated)}</HjmNativeProvider>,
    ));
    const second = render(build(deprecated));
    const messages = warn.mock.calls.map((call: unknown[]) => String(call[0]));
    for (const prop of Object.keys(deprecated)) {
      expect(messages.filter((message: string) => message.includes(`${component}.${prop} is deprecated`)))
        .toHaveLength(1);
    }
    // Only the component's own props are reported, not internal composition.
    expect(messages).toHaveLength(Object.keys(deprecated).length);
    act(() => {
      first.unmount();
      second.unmount();
    });
  });

  it.each(cases)("$component accepts layoutStyle on the root without warning", ({ build }) => {
    const renderer = render(build({ layoutStyle: marker }));
    expect(warn).not.toHaveBeenCalled();
    expect(hasMarker(renderer)).toBe(true);
    act(() => renderer.unmount());
  });

  it("keeps StatisticGroup item widths without attributing them to Statistic.style", () => {
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
