import { Pressable, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { act, create } from "react-test-renderer";
import { beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Menu } from "../src/navigation.js";

/** Native proves accessibility semantics and the Pressable host action, not physical-keyboard bindings. */
export const menuNativeActionCases = [{ componentId: "menu" }] as const;
export const menuNativeLongCopyCases = [{ componentId: "menu" }] as const;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

it.each(["grouped", "anchored", "bottom"] as const)("%s uses the same permission and action contract", async presentation => {
  const action = vi.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<HjmNativeProvider><Menu presentation={presentation} defaultOpen triggerLabel="더보기" dismissLabel="닫기"
      items={[{ id: "edit", label: "편집" }, { id: "locked", label: "잠김", disabled: true }]} onAction={action} /></HjmNativeProvider>);
  });
  const pressables = renderer!.root.findAllByType(Pressable);
  const locked = pressables.find(node => node.props.accessibilityLabel === "잠김")!;
  expect(locked.props.disabled).toBe(true);
  const edit = pressables.find(node => node.props.accessibilityLabel === "편집")!;
  await act(async () => edit.props.onPress());
  expect(action).toHaveBeenCalledExactlyOnceWith("edit");
  act(() => renderer!.unmount());
});

it("measures the Modal origin separately and positions the popup above a row near the bottom", async () => {
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<HjmNativeProvider><Menu presentation="anchored" defaultOpen triggerLabel="댓글 메뉴" dismissLabel="닫기"
      items={[{ id: "report", label: "신고" }, { id: "block", label: "차단" }]} /></HjmNativeProvider>, {
      createNodeMock: element => ({
        measureInWindow: (complete: (x: number, y: number, width: number, height: number) => void) => {
          // A non-zero Modal origin catches status-bar/root coordinate mixing.
          const style = StyleSheet.flatten((element.props as { style?: StyleProp<ViewStyle> }).style);
          if (style?.flex === 1) complete(0, 24, 320, 576);
          else complete(280, 530, 24, 32);
        },
      }),
    });
  });
  await act(async () => renderer!.root.findByType(ScrollView).props.onContentSizeChange(264, 120));
  const menu = renderer!.root.findAll(node => typeof node.type === "string" && node.props.accessibilityRole === "menu")[0]!;
  const style = StyleSheet.flatten(menu.props.style);
  expect(style.opacity).toBe(1);
  expect(style.top + 136).toBeLessThan(506);
  expect(style.left + style.width).toBeLessThanOrEqual(312);
  expect(renderer!.root.findAllByType(Pressable).filter(node => node.props.accessibilityLabel === "닫기")).toHaveLength(1); // backdrop only
  act(() => renderer!.unmount());
});

it("exposes menu items as named host actions and activates an enabled item", async () => {
  const onAction = vi.fn();
  const onOpenChange = vi.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <HjmNativeProvider>
        <Menu
          defaultOpen
          dismissLabel="닫기"
          items={[
            { id: "edit", label: "편집 문서" },
            { id: "locked", label: "잠긴 문서", disabled: true },
          ]}
          onAction={onAction}
          onOpenChange={onOpenChange}
          triggerLabel="문서 메뉴"
        />
      </HjmNativeProvider>,
    );
  });
  const edit = renderer!.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "편집 문서")!;
  const locked = renderer!.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "잠긴 문서")!;
  expect(edit.props.accessibilityRole).toBe("menuitem");
  expect(edit.props.disabled).toBe(false);
  expect(locked.props.accessibilityRole).toBe("menuitem");
  expect(locked.props.accessibilityState.disabled).toBe(true);
  await act(async () => edit.props.onPress());
  expect(onAction).toHaveBeenCalledOnce();
  expect(onAction).toHaveBeenCalledWith("edit");
  expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
  act(() => renderer!.unmount());
});

it("keeps long menu labels and descriptions available to wrapping native Text", async () => {
  const longCopy = "계정 접근 권한과 연결된 문서의 상태를 확인한 뒤 필요한 변경 사항을 선택할 수 있습니다. 화면이 좁아도 전체 안내를 읽을 수 있어야 합니다.";
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <HjmNativeProvider>
        <Menu
          defaultOpen
          dismissLabel="닫기"
          items={[{ id: "details", label: longCopy, description: longCopy }]}
          triggerLabel="계정 메뉴"
        />
      </HjmNativeProvider>,
    );
  });
  const item = renderer!.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === longCopy)!;
  expect(item).toBeDefined();
  const textNodes = item.findAll((node) => node.children.includes(longCopy));
  expect(textNodes.length).toBeGreaterThanOrEqual(1);
  expect(textNodes.every((node) => node.props.numberOfLines === undefined)).toBe(true);
  act(() => renderer!.unmount());
});


it("omits the heading line box for an empty title and retains the accessible menu name", async () => {
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<HjmNativeProvider><Menu defaultOpen title="" triggerLabel="문서 메뉴" dismissLabel="닫기" items={[{ id: "edit", label: "편집" }]} /></HjmNativeProvider>);
  });
  const menu = renderer!.root.findAll((node) => node.props.accessibilityRole === "menu").find((node) => typeof node.type === "string")!;
  expect(menu.props.accessibilityLabel).toBe("문서 메뉴");
  expect(menu.findAll((node) => node.props.variant === "title")).toHaveLength(0);
  act(() => renderer!.unmount());
});
