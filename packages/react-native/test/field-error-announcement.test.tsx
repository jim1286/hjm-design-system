// Shared Field error contract (1.31, internal/field-frame.tsx): every Field-based control keeps its error in an
// assertive live region (Android) and announces each new or changed error once on iOS.
import { AccessibilityInfo, Platform } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField, CheckboxGroup } from "../src/inputs.js";
import { Combobox, Select } from "../src/forms.js";
import { NumberField } from "../src/number-field.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let tree: ReactTestRenderer | undefined;
let previousOS: typeof Platform.OS;
beforeEach(() => { previousOS = Platform.OS; Platform.OS = "ios"; });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; Platform.OS = previousOS; vi.restoreAllMocks(); });

type Props = { error?: string };
const controls: readonly [string, (props: Props) => ReactNode][] = [
  ["TextField", (p) => <TextField label="이메일" {...p} />],
  ["Select", (p) => <Select dismissLabel="닫기" items={[{ id: "ko", label: "한국어", textValue: "한국어" }]} label="언어" placeholder="선택" {...p} />],
  ["Combobox", (p) => <Combobox clearLabel="지우기" dismissLabel="닫기" emptyMessage="없음" items={[{ id: "s", label: "서울", textValue: "서울" }]} label="도시" loadingMessage="검색 중" {...p} />],
  ["NumberField", (p) => <NumberField decrementLabel="감소" incrementLabel="증가" label="수량" min={0} max={10} {...p} />],
  ["CheckboxGroup", (p) => <CheckboxGroup items={[{ id: "a", label: "스포츠" }]} label="관심사" {...p} />],
];

it.each(controls)("%s announces each new error once and keeps it in an assertive region", (_name, control) => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
  const render = (props: Props) => <HjmNativeProvider>{control(props)}</HjmNativeProvider>;
  act(() => { tree = create(render({})); });
  expect(announce).not.toHaveBeenCalled();
  act(() => tree!.update(render({ error: "다시 확인해 주세요" })));
  expect(announce).toHaveBeenCalledTimes(1);
  expect(announce).toHaveBeenLastCalledWith("다시 확인해 주세요");
  const regions = tree!.root.findAll((node) => node.props.accessibilityLiveRegion === "assertive" && typeof node.type !== "string" && JSON.stringify(node.props.children ?? "").includes("다시 확인해 주세요"));
  expect(regions.length).toBeGreaterThan(0);
  act(() => tree!.update(render({ error: "다시 확인해 주세요" })));
  expect(announce).toHaveBeenCalledTimes(1);
  act(() => tree!.update(render({ error: "숫자만 쓸 수 있어요" })));
  expect(announce).toHaveBeenCalledTimes(2);
  expect(announce).toHaveBeenLastCalledWith("숫자만 쓸 수 있어요");
});
