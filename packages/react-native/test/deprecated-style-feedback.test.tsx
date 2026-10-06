import type { ReactElement } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Animated, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

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
import { resetDeprecatedStyleWarningsForTest } from "../src/internal/deprecated-style.js";

// 1.11 kept these raw visual style props; they now warn once in development and gain `layoutStyle`.
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
  resetDeprecatedStyleWarningsForTest();
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
    legacy: () => <Notice style={{ backgroundColor: "red" }} title="알림" />,
    layout: m => <Notice layoutStyle={{ marginTop: m }} title="알림" />,
  },
  {
    name: "EmptyState",
    deprecated: ["style", "illustrationStyle", "titleStyle", "descriptionStyle", "actionStyle"],
    legacy: () => (
      <EmptyState
        action={<View />}
        actionStyle={{ padding: 1 }}
        description="설명"
        descriptionStyle={{ color: "red" }}
        illustration={<View />}
        illustrationStyle={{ padding: 1 }}
        style={{ padding: 1 }}
        title="비어 있어요"
        titleStyle={{ color: "red" }}
      />
    ),
    layout: m => <EmptyState layoutStyle={{ marginTop: m }} title="비어 있어요" />,
  },
  {
    name: "Result",
    deprecated: ["style"],
    legacy: () => <Result status="success" style={{ padding: 1 }} title="완료" />,
    layout: m => <Result layoutStyle={{ marginTop: m }} status="success" title="완료" />,
  },
  {
    name: "Progress",
    deprecated: ["style", "labelStyle", "valueStyle", "trackStyle", "indicatorStyle"],
    legacy: () => (
      <Progress
        indicatorStyle={{ backgroundColor: "red" }}
        label="진행"
        labelStyle={{ color: "red" }}
        style={{ padding: 1 }}
        trackStyle={{ height: 2 }}
        value={50}
        valueStyle={{ color: "red" }}
      />
    ),
    layout: m => <Progress label="진행" layoutStyle={{ marginTop: m }} value={50} />,
  },
  {
    name: "Spinner",
    deprecated: ["style"],
    legacy: () => <Spinner label="로딩" style={{ padding: 1 }} />,
    layout: m => <Spinner label="로딩" layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "Skeleton",
    deprecated: ["style"],
    legacy: () => <Skeleton style={{ backgroundColor: "red" }} />,
    layout: m => <Skeleton layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "Toast",
    deprecated: ["style"],
    legacy: () => <Toast descriptor={toast} style={{ padding: 1 }} />,
    layout: m => <Toast descriptor={toast} layoutStyle={{ marginTop: m }} />,
  },
  {
    name: "ToastRegion",
    deprecated: ["style", "toastStyle"],
    legacy: () => <ToastRegion defaultToasts={[toast]} style={{ padding: 1 }} toastStyle={{ padding: 1 }} />,
    layout: m => <ToastRegion defaultToasts={[toast]} layoutStyle={{ marginTop: m }} />,
  },
];

describe("Native feedback deprecated visual style props", () => {
  for (const testCase of cases) {
    it(`${testCase.name} warns once per deprecated prop and still applies it`, () => {
      render(testCase.legacy());
      act(() => renderer!.update(
        <HjmNativeProvider reducedMotion theme="light">{testCase.legacy()}</HjmNativeProvider>,
      ));
      for (const prop of testCase.deprecated) {
        expect(warnings().filter(m => m.includes(`${testCase.name}.${prop} is deprecated`))).toHaveLength(1);
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

  it("AlertDialog and Sheet contentStyle warn only for visual keys", () => {
    render(<AlertDialog contentStyle={{ marginTop: 3, maxWidth: 400 }} open request={request} />);
    act(() => renderer!.unmount());
    render(<Sheet closeLabel="닫기" contentStyle={{ marginTop: 3 }} open title="설정" />);
    act(() => renderer!.unmount());
    expect(warnings()).toHaveLength(0);

    render(<AlertDialog contentStyle={{ backgroundColor: "red" }} open request={request} />);
    act(() => renderer!.unmount());
    render(<Sheet closeLabel="닫기" contentStyle={{ height: 300 }} open title="설정" />);
    expect(warnings().filter(m => m.includes("AlertDialog.contentStyle is deprecated"))).toHaveLength(1);
    expect(warnings().filter(m => m.includes("Sheet.contentStyle is deprecated"))).toHaveLength(1);
  });
});
