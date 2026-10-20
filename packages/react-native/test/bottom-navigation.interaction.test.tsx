import { act, create } from "react-test-renderer";
import { Text as NativeText, View } from "react-native";
import { __setWindowDimensions } from "./react-native.mock.js";
import { typography } from "@hjmds/design-contracts/foundations";
import { bottomNavigationRecipe } from "@hjmds/design-contracts/recipes";
import { expect, it, vi } from "vitest";
import { BottomNavigation, HjmNativeProvider, Text } from "../src/index.js";
import type { BottomNavigationActivation } from "@hjmds/design-contracts/components/bottom-navigation";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const bottomNavigationActionCases = [{ componentId: "bottom-navigation" }] as const;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("emits navigate and reselect host actions while leaving route selection to the navigator", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/bottom-navigation.interaction.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  const onActivate = vi.fn<(activation: BottomNavigationActivation<"home" | "search">) => void>();
  const label = "주변의 새로운 소식과 업데이트";
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          descriptor={{
            accessibilityLabel: "주요 탐색",
            items: [
              { id: "home", label: "홈", icon: { name: "home" } },
              { id: "search", label, icon: { name: "search" } },
            ],
            selectedKey: "home",
          }}
          getItemTestID={(item) => `destination-${item.id}`}
          onActivate={onActivate}
          renderIcon={({ name }) => <Text>{name}</Text>}
        />
      </HjmNativeProvider>,
    );
  });

  const home = renderer.root.findByProps({ testID: "destination-home" });
  const search = renderer.root.findByProps({ testID: "destination-search" });
  expect(home.props.accessibilityState.selected).toBe(true);
  expect(search.props.accessibilityState.selected).toBe(false);
  expect(search.props.accessibilityLabel).toBe(label);
  expect(renderer.root.findAllByType(Text).some((node) => node.props.children === label)).toBe(true);

  act(() => search.props.onPress());
  expect(onActivate).toHaveBeenLastCalledWith({ key: "search", reason: "navigate" });
  expect(renderer.root.findByProps({ testID: "destination-home" }).props.accessibilityState.selected)
    .toBe(true);
  expect(renderer.root.findByProps({ testID: "destination-search" }).props.accessibilityState.selected)
    .toBe(false);

  act(() => home.props.onPress());
  expect(onActivate).toHaveBeenLastCalledWith({ key: "home", reason: "reselect" });
  expect(onActivate).toHaveBeenCalledTimes(2);
});

it("keeps hidden capsule destinations named and restores visible labels at large text", () => {
  const items = [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "search", label: "검색", icon: { name: "search" } }];
  const activate = vi.fn();
  let tree!: ReturnType<typeof create>;
  const render = (scale: number) => <HjmNativeProvider theme="light" textScale={scale}>
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey: "home", items }} configuration={{ presentation: "capsule", direction: "rtl" }} renderIcon={() => null} onActivate={activate} getItemTestID={item => `capsule-${item.id}`}/>
  </HjmNativeProvider>;
  act(() => { tree = create(render(1)); });
  expect(tree.root.findAllByType(Text).some(node => node.props.children === "검색")).toBe(false);
  const search = tree.root.findByProps({ testID: "capsule-search" });
  expect(search.props.accessibilityLabel).toBe("검색");
  act(() => search.props.onPress());
  expect(activate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });
  expect(tree.root.findByProps({ testID: "capsule-home" }).props.accessibilityState.selected).toBe(true);
  act(() => tree.update(render(1.5)));
  expect(tree.root.findAllByType(Text).some(node => node.props.children === "검색")).toBe(true);
  act(() => tree.unmount());
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("honors the navigation label scale limit under a controlled Provider", () => {
  let tree!: ReturnType<typeof create>;
  const label = "메시지";
  const render = (scale: number) => <HjmNativeProvider theme="light" textScale={scale}>
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey: "home", items: [
      { id: "home", label: "홈", icon: { name: "home" } },
      { id: "messages", label, icon: { name: "mail" } },
    ] }} configuration={{ density: "compact" }} renderIcon={() => null} onActivate={() => undefined} getItemTestID={item => `scaled-${item.id}`} />
  </HjmNativeProvider>;
  act(() => { tree = create(render(3)); });
  const messageText = () => tree.root.findAllByType(NativeText).find(node => node.props.children === label)!;
  const baseSize = typography[bottomNavigationRecipe.density.compact.label].fontSize;
  const style = () => Object.assign({}, ...(Array.isArray(messageText().props.style) ? messageText().props.style : [messageText().props.style]));
  expect(style().fontSize).toBe(baseSize * bottomNavigationRecipe.largeText.maxFontSizeMultiplier);
  expect(tree.root.findByProps({ testID: "scaled-messages" }).props.accessibilityLabel).toBe(label);
  act(() => tree.update(render(1)));
  expect(style().fontSize).toBe(baseSize);
  act(() => tree.unmount());
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("applies the same label limit to OS text without capping sibling body text", () => {
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  let tree!: ReturnType<typeof create>;
  try {
    act(() => { tree = create(<HjmNativeProvider theme="light">
      <Text variant="body">본문</Text>
      <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey: "home", items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "messages", label: "메시지", icon: { name: "mail" } },
      ] }} configuration={{ density: "compact" }} renderIcon={() => null} onActivate={() => undefined} />
    </HjmNativeProvider>); });
    const text = (copy: string) => tree.root.findAllByType(NativeText).find(node => node.props.children === copy)!;
    expect(text("메시지").props.style.fontSize).toBe(typography[bottomNavigationRecipe.density.compact.label].fontSize * 1.4);
    const bodyStyle = Object.assign({}, ...(Array.isArray(text("본문").props.style) ? text("본문").props.style : [text("본문").props.style]));
    expect(bodyStyle.fontSize).toBe(typography.body.fontSize);
    expect(text("본문").props.allowFontScaling).toBe(true);
    expect(text("메시지").props.allowFontScaling).toBe(false);
  } finally {
    act(() => tree.unmount());
    __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 1 });
  }
});


it("tile selection keeps every label and equal width while the router owns selection", () => {
  let tree!: ReturnType<typeof create>;
  const activate = vi.fn();
  const items = [{ id: "home", label: "들판", icon: { name: "home" } }, { id: "search", label: "탐험", icon: { name: "search" } }, { id: "settings", label: "설정", icon: { name: "settings" } }];
  const render = (selectedKey: string) => <HjmNativeProvider theme="light">
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey, items }} configuration={{ presentation: "floating", selection: "tile", density: "compact" }} renderIcon={() => null} onActivate={activate} getItemTestID={item => `tile-${item.id}`} />
  </HjmNativeProvider>;
  act(() => { tree = create(render("home")); });
  for (const item of items) {
    expect(tree.root.findAllByType(Text).some(node => node.props.children === item.label)).toBe(true);
    const target = tree.root.findByProps({ testID: `tile-${item.id}` });
    expect(target.props.style({ pressed: false })[1].flex).toBe(1);
  }
  const home = () => tree.root.findByProps({ testID: "tile-home" });
  const search = () => tree.root.findByProps({ testID: "tile-search" });
  expect(home().props.style({ pressed: false })[1].backgroundColor).not.toBe("transparent");
  act(() => search().props.onPress());
  expect(activate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });
  expect(home().props.accessibilityState.selected).toBe(true);
  act(() => tree.update(render("search")));
  expect(home().props.style({ pressed: false })[1].backgroundColor).toBe("transparent");
  expect(search().props.style({ pressed: false })[1].backgroundColor).not.toBe("transparent");
  act(() => tree.unmount());
});

it("raised tile plank reserves every lower edge and darkens only the selected one", () => {
  let tree!: ReturnType<typeof create>;
  const items = [{ id: "home", label: "들판", icon: { name: "home" } }, { id: "search", label: "탐험", icon: { name: "search" } }];
  act(() => { tree = create(<HjmNativeProvider theme="light">
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey: "home", items }} configuration={{ presentation: "floating", selection: "tile", surface: "raised" }} renderIcon={() => null} onActivate={() => {}} getItemTestID={item => `tile-${item.id}`} />
  </HjmNativeProvider>); });
  const home = tree.root.findByProps({ testID: "tile-home" }).props.style({ pressed: false })[1];
  const search = tree.root.findByProps({ testID: "tile-search" }).props.style({ pressed: false })[1];
  expect(home.borderBottomWidth).toBe(3);
  expect(search.borderBottomWidth).toBe(3);
  expect(home.borderBottomColor).not.toBe("transparent");
  expect(search.borderBottomColor).toBe("transparent");
  act(() => tree.unmount());
});

it("publishes an overlay bar's covered height so ScreenLayout pads its last region by it", async () => {
  const { BottomNavigationInsetProvider, useBottomNavigationInset } = await import("../src/index.js");
  const { ScreenLayout } = await import("../src/screens.js");
  const { ScrollView, View } = await import("react-native");
  const seen: number[] = [];
  function Probe() { seen.push(useBottomNavigationInset()); return null; }
  const bar = (placement: "inline" | "overlay") => (
    <BottomNavigation
      placement={placement}
      configuration={{ presentation: "floating" }}
      descriptor={{ accessibilityLabel: "Main", selectedKey: "home", items: [
        { id: "home", label: "Home", icon: { name: "home" } },
        { id: "search", label: "Search", icon: { name: "search" } },
      ] }}
      onActivate={() => {}}
      renderIcon={({ name }) => <Text>{name}</Text>}
    />
  );
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigationInsetProvider>
          <ScreenLayout title="Feed"><Probe /></ScreenLayout>
          {bar("overlay")}
        </BottomNavigationInsetProvider>
      </HjmNativeProvider>,
    );
  });
  const root = renderer.root.findAll((node) => node.type === View && node.props.pointerEvents === "box-none" && typeof node.props.onLayout === "function")[0]!;
  expect(root.props.style[0]).toMatchObject({ position: "absolute", bottom: 0 });
  act(() => root.props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 96 } } }));
  expect(seen.at(-1)).toBe(96);
  const body = renderer.root.findByType(ScrollView);
  expect(body.props.contentContainerStyle.paddingBottom).toBe(16 + 96);

  // An inline bar takes its own layout height, so it reports nothing.
  act(() => {
    renderer.update(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigationInsetProvider>
          <ScreenLayout title="Feed"><Probe /></ScreenLayout>
          {bar("inline")}
        </BottomNavigationInsetProvider>
      </HjmNativeProvider>,
    );
  });
  expect(seen.at(-1)).toBe(0);
  expect(renderer.root.findByType(ScrollView).props.contentContainerStyle.paddingBottom).toBe(16);
});

it.each([
  { placement: "inline" as const, prominent: true, clearance: 20 },
  { placement: "inline" as const, prominent: false, clearance: 0 },
  { placement: "overlay" as const, prominent: true, clearance: 0 },
])("reserves $clearance points above $placement navigation (prominent=$prominent)", ({ placement, prominent, clearance }) => {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">
      <BottomNavigation placement={placement}
        descriptor={{ accessibilityLabel: "Main", selectedKey: "write", items: [
          { id: "trail", label: "Trail", icon: { name: "home" } },
          { id: "write", label: "Write", icon: { name: "add" }, prominent },
          { id: "nest", label: "Nest", icon: { name: "person" } },
        ] }} onActivate={() => {}} renderIcon={() => null} />
    </HjmNativeProvider>);
  });
  const bar = renderer.root.findByType(BottomNavigation).findAllByType(View)[0]!;
  // Only inline navigation participates in the preceding footer's flow; overlays use the inset reporter.
  expect(bar.props.style[0].paddingTop).toBe(clearance);
  expect(bar.props.style[0].marginTop ?? 0).toBe(0);
  act(() => renderer.unmount());
});

it("draws a prominent center destination as a selectable lifted circle and sizes app-icon slots", () => {
  const icons: Array<{ id: string; size: number; color: string }> = [];
  const items = [
    { id: "trail", label: "Trail", icon: { name: "home" } },
    { id: "write", label: "Write", icon: { name: "add" }, prominent: true },
    { id: "nest", label: "Nest", icon: { name: "person" } },
  ];
  const onActivate = vi.fn();
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          configuration={{ iconSize: "xlarge" }}
          descriptor={{ accessibilityLabel: "Main", selectedKey: "trail", items }}
          getItemTestID={(item) => `tab-${item.id}`}
          onActivate={onActivate}
          renderIcon={({ item, size, color }) => { icons.push({ id: item.id, size, color }); return <Text>{item.id}</Text>; }}
        />
      </HjmNativeProvider>,
    );
  });
  expect(icons.find((icon) => icon.id === "trail")?.size).toBe(bottomNavigationRecipe.iconSizes.xlarge);
  expect(icons.find((icon) => icon.id === "write")?.size).toBe(28);
  act(() => renderer.root.findByProps({ testID: "tab-write" }).props.onPress());
  expect(onActivate).toHaveBeenLastCalledWith({ key: "write", reason: "navigate" });
  expect(renderer.root.findByProps({ testID: "tab-write" }).props.accessibilityRole).toBe("tab");
  expect(() => act(() => {
    renderer.update(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          configuration={{ presentation: "floating", selection: "tile" }}
          descriptor={{ accessibilityLabel: "Main", selectedKey: "trail", items }}
          onActivate={onActivate}
          renderIcon={() => null}
        />
      </HjmNativeProvider>,
    );
  })).toThrow("prominent destination requires");
});

it("frames a floating bar with a recipe shape and lifts the selected artwork while dimming idle artwork", () => {
  const items = [
    { id: "home", label: "Home", icon: { name: "home" } },
    { id: "search", label: "Search", icon: { name: "search" }, badge: { count: 2, accessibilityLabel: "2 new" } },
  ];
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          configuration={{ presentation: "floating", shape: "pill", iconEmphasis: "lift", iconSize: "xlarge" }}
          descriptor={{ accessibilityLabel: "Dock", selectedKey: "home", items }}
          getItemTestID={(item) => `dock-${item.id}`}
          onActivate={() => {}}
          renderIcon={({ item }) => <Text testID={`art-${item.id}`}>{item.id}</Text>}
        />
      </HjmNativeProvider>,
    );
  });
  const shape = bottomNavigationRecipe.shapes.pill;
  const lift = bottomNavigationRecipe.icon.liftEmphasis;
  const flatStyle = (style: unknown) => Object.assign({}, ...[style].flat(3).filter(Boolean)) as Record<string, unknown>;
  const tablist = renderer.root.findByProps({ accessibilityRole: "tablist" });
  expect(flatStyle(tablist.props.style).padding).toBe(shape.surfacePadding);
  // The frame View (tablist parent) takes the pill radius token instead of floating's xl.
  expect(flatStyle(tablist.parent?.props.style).borderRadius).toBe(999);
  const indicatorOf = (id: string) => renderer.root.findByProps({ testID: `dock-${id}` })
    .findAll((node) => typeof node.type === "string" && node.props.importantForAccessibility === "no-hide-descendants")[0]!;
  expect(flatStyle(indicatorOf("home").props.style).transform).toEqual([
    { translateY: lift.translateY },
    { scale: bottomNavigationRecipe.icon.selectedEmphasis.scale.selected },
  ]);
  expect(flatStyle(indicatorOf("search").props.style).transform).toEqual([
    { scale: bottomNavigationRecipe.icon.selectedEmphasis.scale.idle },
  ]);
  // Only the idle artwork dims; the selected artwork and the badge keep full opacity.
  const artParent = (id: string) => renderer.root.findByProps({ testID: `art-${id}` }).parent;
  expect(flatStyle(artParent("search")?.props.style).opacity).toBe(lift.idleOpacity);
  expect(flatStyle(artParent("home")?.props.style).opacity).toBeUndefined();
  act(() => renderer.unmount());
});

it("keeps the floating recipe frame and scale emphasis by default", () => {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          configuration={{ presentation: "floating" }}
          descriptor={{ accessibilityLabel: "Main", selectedKey: "home", items: [
            { id: "home", label: "Home", icon: { name: "home" } },
            { id: "search", label: "Search", icon: { name: "search" } },
          ] }}
          onActivate={() => {}}
          renderIcon={({ item }) => <Text testID={`glyph-${item.id}`}>{item.id}</Text>}
        />
      </HjmNativeProvider>,
    );
  });
  const tablist = renderer.root.findByProps({ accessibilityRole: "tablist" });
  const style = Object.assign({}, ...[tablist.props.style].flat(3).filter(Boolean)) as Record<string, unknown>;
  expect(style.padding).toBe(0);
  expect(renderer.root.findAll((node) => node.props.style?.opacity === bottomNavigationRecipe.icon.liftEmphasis.idleOpacity)).toHaveLength(0);
  act(() => renderer.unmount());
});
