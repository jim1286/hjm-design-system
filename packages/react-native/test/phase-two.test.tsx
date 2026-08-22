import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  AccessibilityInfo,
  Image as NativeImage,
  Modal,
  View,
} from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Accordion,
  Avatar,
  BottomNavigation,
  DescriptionList,
  Divider,
  Field,
  Form,
  HjmNativeProvider,
  Image,
  Link,
  LoadMore,
  Menu,
  Select,
  Text,
  ToastRegion,
  useToastRegion,
  type ToastRegionController,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderWithProvider(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        {node}
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function byA11y(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("@hjm/react-native extended mobile renderer", () => {
  it("routes Link descriptors without weakening native link semantics", () => {
    const onNavigate = vi.fn();
    const renderer = renderWithProvider(
      <Link
        descriptor={{
          label: "설정",
          destination: { kind: "internal", href: "/settings" },
        }}
        onNavigate={onNavigate}
      />,
    );
    const link = byA11y(renderer, "설정");
    expect(link.props.accessibilityRole).toBe("link");
    expect(flattenStyle(link.props.style({ pressed: false }))).toMatchObject({ minHeight: 44, minWidth: 44 });
    act(() => link.props.onPress());
    expect(onNavigate).toHaveBeenCalledWith({ kind: "internal", href: "/settings" });
  });

  it("frames custom fields and prevents concurrent Form submission", async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const renderer = renderWithProvider(
      <Form
        fallbackErrorMessage="요청을 완료하지 못했습니다."
        label="프로필"
        onSubmit={onSubmit}
        submitLabel="저장"
        values={{ name: "민" }}
      >
        <Field description="공개 이름" label="이름" required>
          {(props) => <View {...props} accessibilityRole="button" />}
        </Field>
      </Form>,
    );
    expect(byA11y(renderer, "이름 *").props.accessibilityHint).toBe("공개 이름");
    const submit = byA11y(renderer, "저장");
    act(() => submit.props.onPress());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(byA11y(renderer, "저장").props.accessibilityState.busy).toBe(true);
    act(() => byA11y(renderer, "저장").props.onPress());
    expect(onSubmit).toHaveBeenCalledOnce();
    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(byA11y(renderer, "저장").props.accessibilityState.busy).toBe(false);
  });

  it("opens Select as a reduced-motion modal, selects an option, and restores focus", () => {
    const onValueChange = vi.fn();
    const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const renderer = renderWithProvider(
      <Select
        dismissLabel="선택 목록 닫기"
        defaultValue="ko"
        label="언어"
        placeholder="언어 선택"
        onValueChange={onValueChange}
        options={[
          { value: "ko", label: "한국어" },
          { value: "en", label: "English" },
        ]}
      />,
    );
    const trigger = byA11y(renderer, "언어");
    expect(trigger.props.accessibilityRole).toBe("combobox");
    expect(trigger.props.accessibilityValue).toEqual({ text: "한국어" });
    act(() => trigger.props.onPress());
    expect(renderer.root.findByType(Modal).props).toMatchObject({ visible: true, animationType: "none" });
    act(() => renderer.root.findByType(Modal).props.onShow());
    expect(focus).toHaveBeenCalledWith(1);
    act(() => byA11y(renderer, "English").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("en");
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    expect(focus).toHaveBeenCalledTimes(2);
  });

  it("exposes bottom destinations and modal menu actions with Native roles", () => {
    const onActivate = vi.fn();
    const renderer = renderWithProvider(
      <>
        <BottomNavigation
          descriptor={{
            accessibilityLabel: "주요 메뉴",
            items: [
              { id: "home", label: "홈", icon: { name: "home" } },
              { id: "profile", label: "프로필", icon: { name: "profile" } },
            ],
            selectedKey: "home",
          }}
          onActivate={onActivate}
          renderIcon={({ name }) => <Text>{name}</Text>}
        />
        <Menu
          dismissLabel="메뉴 닫기"
          items={[{ value: "edit", label: "수정" }, { value: "delete", label: "삭제", tone: "danger" }]}
          onSelect={vi.fn()}
          triggerLabel="더보기"
        />
      </>,
    );
    expect(renderer.root.find((node) => node.props.accessibilityRole === "tablist")).toBeTruthy();
    const profile = byA11y(renderer, "프로필");
    act(() => profile.props.onPress());
    expect(onActivate).toHaveBeenCalledWith({ key: "profile", reason: "navigate" });
    expect(byA11y(renderer, "프로필").props.accessibilityState.selected).toBe(false);

    act(() => byA11y(renderer, "더보기").props.onPress());
    expect(renderer.root.find((node) => node.props.accessibilityRole === "menu")).toBeTruthy();
    const item = byA11y(renderer, "수정");
    expect(item.props.accessibilityRole).toBe("menuitem");
    expect(flattenStyle(item.props.style({ pressed: false }))).toMatchObject({ minHeight: 44, minWidth: 44 });
    act(() => item.props.onPress());
    expect(renderer.root.findAllByType(Modal).at(-1)!.props.visible).toBe(false);
  });

  it("renders display families with explicit media and expansion accessibility", () => {
    const renderer = renderWithProvider(
      <>
        <Avatar accessibilityLabel="김민 프로필" name="김 민" />
        <Divider />
        <Accordion
          label="도움말"
          items={[{ value: "shipping", title: "배송", content: <Text>내일 도착</Text> }]}
        />
        <DescriptionList
          availableWidth={800}
          descriptor={{ items: [{ id: "country", label: "국가", value: "대한민국" }], columns: 2 }}
          label="계정 정보"
        />
        <Image
          accessibilityLabel="산 이미지"
          fallback={<Text>이미지 없음</Text>}
          source={{ uri: "https://example.com/mountain.png" }}
        />
      </>,
    );
    expect(renderer.root.find(
      (node) => node.props.accessibilityLabel === "김민 프로필" && node.props.accessibilityRole === "image",
    )).toBeTruthy();
    expect(renderer.root.findAll((node) => node.type === View && node.props.accessible === false).length).toBeGreaterThan(0);
    const accordion = byA11y(renderer, "배송");
    expect(accordion.props.accessibilityState.expanded).toBe(false);
    act(() => accordion.props.onPress());
    expect(byA11y(renderer, "배송").props.accessibilityState.expanded).toBe(true);
    expect(flattenStyle(byA11y(renderer, "국가, 대한민국").props.style).width).toBe(394);
    expect(renderer.root.find(
      (node) => node.props.accessibilityLabel === "산 이미지" && node.props.accessibilityRole === "image",
    )).toBeTruthy();
    act(() => renderer.root.findByType(NativeImage).props.onError({}));
    expect(renderer.root.findAll((node) => node.children.includes("이미지 없음"))).not.toHaveLength(0);
  });

  it("gates automatic and manual LoadMore requests by contract state", async () => {
    const onAutomatic = vi.fn(async () => undefined);
    const labels = { loadMore: "더 보기", loading: "불러오는 중", retry: "다시 시도", complete: "모두 불러옴" };
    renderWithProvider(
      <LoadMore
        descriptor={{ state: { status: "ready", requestKey: "page-2" }, labels }}
        onLoadMore={onAutomatic}
      />,
    );
    expect(onAutomatic).toHaveBeenCalledOnce();
    expect(onAutomatic).toHaveBeenCalledWith({ requestKey: "page-2", reason: "viewport" });

    const onManual = vi.fn(async () => undefined);
    const manual = renderWithProvider(
      <LoadMore
        descriptor={{ state: { status: "ready", requestKey: "page-3" }, labels }}
        mode="manual"
        onLoadMore={onManual}
      />,
    );
    await act(async () => {
      byA11y(manual, "더 보기").props.onPress();
      await Promise.resolve();
    });
    expect(onManual).toHaveBeenCalledWith({ requestKey: "page-3", reason: "manual" });
  });

  it("queues, announces, and times out ToastRegion notifications", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    let controller: ToastRegionController | undefined;
    function Publisher() {
      controller = useToastRegion();
      return null;
    }
    const renderer = renderWithProvider(
      <ToastRegion>
        <Publisher />
      </ToastRegion>,
    );
    act(() => {
      controller?.show({
        id: "saved",
        title: "저장됨",
        description: "변경사항을 저장했습니다.",
        closeLabel: "알림 닫기",
        onDismiss,
      });
    });
    const announcement = byA11y(renderer, "저장됨. 변경사항을 저장했습니다.");
    expect(announcement.props.accessibilityLiveRegion).toBe("polite");
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onDismiss).toHaveBeenCalledWith("timeout");
    expect(renderer.root.findAll((node) => node.props.accessibilityLabel === "알림 닫기")).toHaveLength(0);
  });
});
