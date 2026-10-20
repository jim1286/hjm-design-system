import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { afterEach, describe, expect, it } from "vitest";
import { List, ListRow, ListSeparator } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const lines = () => tree!.root.findAllByType(View).filter(node => flat(node.props.style).height === 1);

describe.each(["ltr", "rtl"] as const)("shared list separators (%s)", direction => {
  it("adds no focus target or row and keeps content insets independent from leading", () => {
    act(() => { tree = create(<HjmNativeProvider direction={direction} theme="dark"><ListSeparator leading layoutStyle={{ marginHorizontal: 16 }} /><ListSeparator separator="none" /></HjmNativeProvider>); });
    expect(lines()).toHaveLength(1);
    expect(lines()[0]!.props).toMatchObject({ accessible: false, importantForAccessibility: "no" });
    expect(flat(lines()[0]!.props.style)).toMatchObject({ marginStart: 0, marginEnd: 0 });
    expect(flat(lines()[0]!.props.style).marginHorizontal).toBeUndefined();
    expect(flat(lines()[0]!.parent!.props.style)).toMatchObject({ marginHorizontal: 16 });
    expect(tree!.root.findAllByType(Pressable)).toHaveLength(0);
  });
  it("lets a finite control list own exactly n-1 content-edge separators", () => {
    act(() => { tree = create(<HjmNativeProvider direction={direction}><List label="설정" separator="content"><ListRow title="첫 행" /><ListRow title="다음 행" /><ListRow title="마지막 행" /></List></HjmNativeProvider>); });
    expect(lines()).toHaveLength(2);
    for (const line of lines()) expect(flat(line.props.style)).toMatchObject({ marginStart: 0, marginEnd: 0 });
  });
});
