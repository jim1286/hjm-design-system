import type { ComponentProps, ReactElement } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Animated, View } from "react-native";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi, type MockInstance } from "vitest";

import {
  AlertDialog,
  EmptyState,
  HjmNativeProvider,
  Notice,
  Progress,
  Result,
  Sheet,
  Skeleton,
  Spinner,
  Toast,
  ToastRegion,
} from "../src/index.js";
import { alertDialogRecipe, emptyStateRecipe } from "@hjmds/design-contracts/recipes";
import { glyph } from "@hjmds/design-contracts/tokens";

// Removed visual overrides must not re-enter host props; placement stays supported.
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer | undefined;
let warn: MockInstance<typeof console.warn>;

function render(node: ReactElement): ReactTestRenderer {
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (typeof style === "function") return flattenStyle(style({ pressed: false }));
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

function hasPlacement(root: ReactTestRenderer, marker: number): boolean {
  const hosts: ReactTestInstance[] = [
    ...root.root.findAllByType(View),
    ...root.root.findAllByType(Animated.View),
  ];
  return hosts.some(node => flattenStyle(node.props.style).marginTop === marker);
}

function warnings(): string[] {
  return warn.mock.calls.map((call: unknown[]) => String(call[0]));
}

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  vi.restoreAllMocks();
});

const toast = { id: "t", description: "저장했어요", durationMs: null, closeLabel: "알림 닫기" } as const;

type Case = Readonly<{
  name: string;
  deprecated: readonly string[];
  legacy: () => ReactElement;
  layout: (marker: number) => ReactElement;
}>;

const cases: readonly Case[] = [
  {
    name: "Notice",
    deprecated: ["style"],
    legacy: () => <Notice {...{ style: { backgroundColor: "red" } } as Record<string, unknown>} title="알림" />,
    layout: m => <Notice layoutStyle={{ marginTop: m }} title="알림" />,
  },
  {
    name: "EmptyState",
    deprecated: ["style", "illustrationStyle", "titleStyle", "descriptionStyle", "actionStyle"],
    legacy: () => (
      <EmptyState
        action={<View />}
        {...{ actionStyle: { padding: 1 } } as Record<string, unknown>}
        description="설명"
        {...{ descriptionStyle: { color: "red" } } as Record<string, unknown>}
        illustration={<View />}
        {...{ illustrationStyle: { padding: 1 } } as Record<string, unknown>}
        {...{ style: { padding: 1 } } as Record<string, unknown>}
        title="비어 있어요"
        {...{ titleStyle: { color: "red" } } as Record<string, unknown>}
      />
    ),
    layout: m => <EmptyState layoutStyle={{ marginTop: m }} title="비어 있어요" />,
  },
  {
    name: "Result",
    deprecated: ["style"],
    legacy: () => <Result status="success" {...{ style: { padding: 1 } } as Record<string, unknown>} title="완료" />,
    layout: m => <Result layoutStyle={{ marginTop: m }} status="success" title="완료" />,
  },
  {
    name: "Progress",
    deprecated: ["style", "labelStyle", "valueStyle", "trackStyle", "indicatorStyle"],
    legacy: () => (
      <Progress
        {...{ indicatorStyle: { backgroundColor: "red" } } as Record<string, unknown>}
        label="진행"
        {...{ labelStyle: { color: "red" } } as Record<string, unknown>}
        {...{ style: { padding: 1 } } as Record<string, unknown>}
        {...{ trackStyle: { height: 2 } } as Record<string, unknown>}
        value={50}
        {...{ valueStyle: { color: "red" } } as Record<string, unknown>}
      />
    ),
    layout: m => <Progress label="진행" layoutStyle={{ marginTop: m }} value={50} />,
  },
  {
    name: "Spinner",
    deprecated: ["style"],
    legacy: () => <Spinner label="로딩" {...{ style: { padding: 1 } } as Record<string, unknown>} />,
    layout: m => <Spinner label="로딩" layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "Skeleton",
    deprecated: ["style"],
    legacy: () => <Skeleton {...{ style: { backgroundColor: "red" } } as Record<string, unknown>} />,
    layout: m => <Skeleton layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "Toast",
    deprecated: ["style"],
    legacy: () => <Toast descriptor={toast} {...{ style: { padding: 1 } } as Record<string, unknown>} />,
    layout: m => <Toast descriptor={toast} layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "ToastRegion",
    deprecated: ["style", "toastStyle"],
    legacy: () => <ToastRegion defaultToasts={[toast]} {...{ style: { padding: 1 } } as Record<string, unknown>} {...{ toastStyle: { padding: 1 } } as Record<string, unknown>} />,
    layout: m => <ToastRegion defaultToasts={[toast]} layoutStyle={{ marginTop: m }} />,
  },
];

describe("Native feedback removed visual style props", () => {
  for (const testCase of cases) {
    it(`${testCase.name} no longer accepts removed visual overrides`, () => {
      if (["Progress", "Spinner", "Skeleton", "Toast", "ToastRegion"].includes(testCase.name)) {
        const root = render(testCase.legacy());
        expect(root.root.findAll(node => typeof node.type === "string").some(node => { const style = flattenStyle(node.props.style); return style.padding === 1 || style.color === "red" || style.backgroundColor === "red"; })).toBe(false);
      } else {
        expect(() => render(testCase.legacy())).toThrow(/removed/);
      }
    });

    it(`${testCase.name} accepts layoutStyle on the root without a warning`, () => {
      const root = render(testCase.layout(37));
      expect(hasPlacement(root, 37)).toBe(true);
      expect(warnings().filter(m => m.includes(`${testCase.name}.`))).toHaveLength(0);
    });
  }

  const request = {
    mode: "confirm",
    title: "정리할까요?",
    description: "지금까지의 대화를 정리해요.",
    confirmLabel: "정리하기",
    cancelLabel: "취소",
  } as const;

  it.each(["small", "medium", "large"] as const)("AlertDialog %s uses recipe sizing with layout-only placement", size => {
    const root = render(<AlertDialog size={size} contentStyle={{ marginTop: 3 }} open request={request} />);
    const frame = root.root.findAllByType(View).find(node => node.props.role === "alertdialog")!;
    expect(flattenStyle(frame.props.style)).toMatchObject({ marginTop: 3, maxWidth: alertDialogRecipe.sizes[size].maxWidth, padding: alertDialogRecipe.sizes[size].padding });
  });

  it("Sheet keeps layout-only contentStyle", () => {
    const root = render(<Sheet closeLabel="닫기" contentStyle={{ marginTop: 3 }} open title="설정" />);
    expect(hasPlacement(root, 3)).toBe(true);
  });

  it("lets a large illustration own its size while retaining the minimum icon frame", () => {
    const root = render(<EmptyState title="Empty" illustration={<View testID="large-art" style={{ width: 160, height: 120 }} />} />);
    const art = root.root.findByProps({ testID: "large-art" });
    const frame = art.parent!;
    expect(flattenStyle(frame.props.style)).toMatchObject({ minWidth: glyph[emptyStateRecipe.icon.size], minHeight: glyph[emptyStateRecipe.icon.size] });
    expect(flattenStyle(frame.props.style)).not.toHaveProperty("width");
    expect(flattenStyle(frame.props.style)).not.toHaveProperty("height");
    expect(flattenStyle(art.props.style)).toMatchObject({ width: 160, height: 120 });
  });

  it("removes legacy keys from the public feedback types", () => {
    expectTypeOf<Extract<keyof ComponentProps<typeof EmptyState>, "style" | "illustrationStyle" | "titleStyle" | "descriptionStyle" | "actionStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof Progress>, "style" | "labelStyle" | "valueStyle" | "trackStyle" | "indicatorStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof ToastRegion>, "style" | "toastStyle">>().toEqualTypeOf<never>();
  });
});
