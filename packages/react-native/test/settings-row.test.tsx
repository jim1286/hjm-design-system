import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Switch as NativeSwitch, ScrollView } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Switch } from "../src/inputs.js";
import { AuthScreenLayout } from "../src/auth-screen.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
afterEach(() => { act(() => renderer?.unmount()); });

it("uses one entire row as the switch target, preserving description and reflow at large text", () => {
  const change = vi.fn();
  act(() => { renderer = create(<HjmNativeProvider textScale={2}>
    <Switch testID="settings" label="댓글 알림" description="댓글이 도착하면 알려드려요" checked={false} onCheckedChange={change} />
  </HjmNativeProvider>); });
  const row = renderer.root.findByType(Pressable);
  expect(row.props).toMatchObject({ testID: "settings", accessibilityRole: "switch", accessibilityLabel: "댓글 알림", accessibilityHint: "댓글이 도착하면 알려드려요" });
  expect(Object.assign({}, ...row.props.style({ pressed: false }))).toMatchObject({ flexDirection: "column", alignItems: "flex-start" });
  const native = renderer.root.findByType(NativeSwitch);
  expect(native.props).toMatchObject({ accessible: false, pointerEvents: "none" });
  act(() => row.props.onPress());
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
});

it("keeps the auth form scrollable with submit taps and footer keyboard clearance", () => {
  act(() => { renderer = create(<HjmNativeProvider><AuthScreenLayout testID="login" hero={<Text>로그인</Text>}
    main={<Text>입력</Text>} footer={<Text>개인정보처리방침</Text>} /></HjmNativeProvider>); });
  const scroll = renderer.root.findByType(ScrollView);
  expect(scroll.props).toMatchObject({ testID: "login", keyboardShouldPersistTaps: "handled", automaticallyAdjustKeyboardInsets: true });
  expect(scroll.findAllByType(Text).map((node) => node.props.children)).toEqual(["로그인", "입력", "개인정보처리방침"]);
});
