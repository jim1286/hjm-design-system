import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { FollowListScreen } from "../src/follow-list.js";
import { ListRow } from "../src/data-display.js";
import { Button } from "../src/actions.js";
import { Tabs } from "../src/navigation.js";
const labels = { followers: "팔로워 12", following: "팔로잉 3", tabs: "관계", search: "검색", clearSearch: "지우기", searching: "검색 중", empty: "결과 없음", follow: "팔로우", followed: "팔로잉", pending: "변경 중", failed: "실패" };
it("isolates profile navigation and follow mutation, recovers after rejection and forwards tab changes", async () => {
  let tree!: ReactTestRenderer; let reject!: (error: Error) => void;
  const open = vi.fn(), tab = vi.fn(), change = vi.fn(() => new Promise<void>((_, no) => { reject = no; }));
  await act(async () => { tree = create(<HjmNativeProvider><FollowListScreen title="jimin.archive" labels={labels}
    tab="followers" onTabChange={tab} query="" onQueryChange={() => {}}
    people={[{id:"one",username:"minji.archive",name:"김민지",following:false}]}
    onOpenProfile={open} onFollowChange={change} /></HjmNativeProvider>); });
  await act(async () => { tree.root.findByType(ListRow).props.onPress(); });
  expect(open).toHaveBeenCalledWith("one");
  await act(async () => { const button = tree.root.findByType(Button); button.props.onPress(); button.props.onPress(); });
  expect(change).toHaveBeenCalledTimes(1); expect(tree.root.findByType(Button).props.loading).toBe(true);
  await act(async () => reject(new Error("offline")));
  expect(tree.root.findByType(Button).props.loading).toBe(false);
  expect(tree.root.findByType(Button).props.children).toBe("팔로우");
  expect(tree.root.findAll(node => node.props.accessibilityRole === "alert").length).toBeGreaterThan(0);
  await act(async () => tree.root.findByType(Tabs).props.onValueChange("following"));
  expect(tab).toHaveBeenCalledWith("following");
  await act(async () => tree.unmount());
});

it("keeps the shared header below the window inset once in ready, loading and error states", async () => {
  const { ScreenHost } = await import("../src/screens.js");
  const { View, StyleSheet } = await import("react-native");
  let tree!: ReactTestRenderer;
  for (const top of [0, 47, 62]) for (const kind of ["ready", "loading", "error"] as const) {
    await act(async () => { tree = create(<HjmNativeProvider safeAreaInsets={{ top, bottom: 34, left: 0, right: 0 }}>
      <ScreenHost testID="follow-host"><FollowListScreen title="Profile" labels={labels}
        tab="followers" onTabChange={() => {}} query="" onQueryChange={() => {}}
        people={[]} onOpenProfile={() => {}} onFollowChange={() => {}}
        state={kind === "ready" ? { kind } : { kind, title: kind }} />
      </ScreenHost></HjmNativeProvider>); });
    const host = tree.root.findByProps({ testID: "follow-host" }).findByType(View);
    expect(StyleSheet.flatten(host.props.style).paddingTop).toBe(top);
    const header = host.findAllByType(View).find(node => StyleSheet.flatten(node.props.style)?.minHeight === 52);
    expect(header).toBeDefined();
    expect(StyleSheet.flatten(header!.props.style).paddingTop ?? 0).toBe(0);
    // There is one window inset owner even when the screen replaces its body with a state.
    expect(tree.root.findAllByType(ScreenHost)).toHaveLength(1);
    await act(async () => tree.unmount());
  }
});
