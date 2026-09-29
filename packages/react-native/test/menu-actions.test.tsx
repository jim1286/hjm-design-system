import { Pressable } from "react-native";
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
            { value: "edit", label: "편집 문서" },
            { value: "locked", label: "잠긴 문서", disabled: true },
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
          items={[{ value: "details", label: longCopy, description: longCopy }]}
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
