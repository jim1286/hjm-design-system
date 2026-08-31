import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

import {
  HjmNativeProvider,
  RadioGroup,
  SegmentedControl,
  Switch,
  Tabs,
  Text,
  type RadioGroupItem,
  type RadioGroupProps,
  type SegmentedControlItem,
  type SegmentedControlProps,
  type SwitchProps,
  type TabItem,
  type TabsProps,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode): ReactTestRenderer {
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

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

describe("React Native canonical prop aliases", () => {
  it("exports canonical collection item types from the public entry", () => {
    const radioItem = {
      value: "standard",
      label: "일반",
    } satisfies RadioGroupItem<"standard">;
    const segmentedItem = {
      value: "list",
      label: "목록",
    } satisfies SegmentedControlItem<"list">;

    const radio = render(
      <RadioGroup accessibilityLabel="public radio" items={[radioItem]} />,
    );
    const segmented = render(
      <SegmentedControl items={[segmentedItem]} label="public segmented" />,
    );
    expect(byLabel(radio, "일반").props.accessibilityRole).toBe("radio");
    expect(byLabel(segmented, "목록").props.accessibilityRole).toBe("radio");
  });

  it("keeps canonical and legacy prop families exclusive in TypeScript", () => {
    const canonicalSwitch = { label: "알림", checked: true } satisfies SwitchProps;
    const legacySwitch = { label: "알림", value: true } satisfies SwitchProps;
    const canonicalRadio = {
      accessibilityLabel: "배송",
      items: [{ value: "standard", label: "일반" }],
    } satisfies RadioGroupProps;
    const legacyRadio = {
      accessibilityLabel: "배송",
      options: [{ value: "standard", label: "일반" }],
    } satisfies RadioGroupProps;
    const canonicalSegmented = {
      label: "보기",
      items: [{ value: "list", label: "목록" }],
    } satisfies SegmentedControlProps;
    const legacySegmented = {
      label: "보기",
      options: [{ value: "list", label: "목록" }],
    } satisfies SegmentedControlProps;

    expect(canonicalSwitch.checked).toBe(true);
    expect(legacySwitch.value).toBe(true);
    expect(canonicalRadio.items).toHaveLength(1);
    expect(legacyRadio.options).toHaveLength(1);
    expect(canonicalSegmented.items).toHaveLength(1);
    expect(legacySegmented.options).toHaveLength(1);

    // @ts-expect-error Canonical and legacy Switch state channels cannot be mixed.
    const mixedSwitch = { label: "알림", checked: true, value: true } satisfies SwitchProps;
    // @ts-expect-error RadioGroup requires exactly one collection prop.
    const mixedRadio = { accessibilityLabel: "배송", items: [], options: [] } satisfies RadioGroupProps;
    // @ts-expect-error SegmentedControl requires exactly one collection prop.
    const missingSegmented = { label: "보기" } satisfies SegmentedControlProps;
    void mixedSwitch;
    void mixedRadio;
    void missingSegmented;
  });

  it("supports canonical Switch state and preserves deprecated aliases", () => {
    const controlledChange = vi.fn();
    const controlled = render(
      <Switch
        checked={false}
        label="controlled canonical switch"
        onCheckedChange={controlledChange}
      />,
    );
    act(() => byLabel(controlled, "controlled canonical switch").props.onPress());
    expect(controlledChange).toHaveBeenCalledWith(true);
    expect(
      byLabel(controlled, "controlled canonical switch").props.accessibilityState.checked,
    ).toBe(false);

    const onCheckedChange = vi.fn();
    const canonical = render(
      <Switch
        defaultChecked
        label="canonical switch"
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(byLabel(canonical, "canonical switch").props.accessibilityState.checked).toBe(true);
    act(() => byLabel(canonical, "canonical switch").props.onPress());
    expect(onCheckedChange).toHaveBeenCalledWith(false);

    const onValueChange = vi.fn();
    const legacy = render(
      <Switch
        defaultValue
        label="legacy switch"
        onValueChange={onValueChange}
      />,
    );
    act(() => byLabel(legacy, "legacy switch").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it("rejects mixed Switch state channels at runtime", () => {
    const props = {
      checked: false,
      label: "mixed switch",
      onCheckedChange: vi.fn(),
      value: false,
    } as unknown as SwitchProps;
    expect(() => render(<Switch {...props} />)).toThrow(/cannot mix/u);
  });

  it("supports canonical RadioGroup items and preserves deprecated options", () => {
    const canonicalChange = vi.fn();
    const canonical = render(
      <RadioGroup
        accessibilityLabel="canonical radio"
        defaultValue="standard"
        items={[
          { value: "standard", label: "일반" },
          { value: "fast", label: "빠름" },
        ]}
        onValueChange={canonicalChange}
      />,
    );
    act(() => byLabel(canonical, "빠름").props.onPress());
    expect(canonicalChange).toHaveBeenCalledWith("fast");

    const legacy = render(
      <RadioGroup
        accessibilityLabel="legacy radio"
        options={[{ value: "standard", label: "일반" }]}
      />,
    );
    expect(byLabel(legacy, "일반").props.accessibilityState.checked).toBe(false);
  });

  it("requires exactly one RadioGroup collection prop at runtime", () => {
    const item = { value: "standard", label: "일반" } as const;
    const mixed = {
      accessibilityLabel: "mixed radio",
      items: [item],
      options: [item],
    } as unknown as RadioGroupProps;
    const missing = { accessibilityLabel: "missing radio" } as RadioGroupProps;
    expect(() => render(<RadioGroup {...mixed} />)).toThrow(/exactly one of items or options/u);
    expect(() => render(<RadioGroup {...missing} />)).toThrow(/exactly one of items or options/u);
  });

  it("supports canonical SegmentedControl items and preserves deprecated options", () => {
    const canonicalChange = vi.fn();
    const canonical = render(
      <SegmentedControl
        defaultValue="list"
        items={[
          { value: "list", label: "목록" },
          { value: "grid", label: "격자" },
        ]}
        label="canonical segmented"
        onValueChange={canonicalChange}
      />,
    );
    act(() => byLabel(canonical, "격자").props.onPress());
    expect(canonicalChange).toHaveBeenCalledWith("grid");

    const legacy = render(
      <SegmentedControl
        label="legacy segmented"
        options={[{ value: "list", label: "목록" }]}
      />,
    );
    expect(byLabel(legacy, "목록").props.accessibilityState.checked).toBe(true);
  });

  it("requires exactly one SegmentedControl collection prop at runtime", () => {
    const item = { value: "list", label: "목록" } as const;
    const mixed = {
      items: [item],
      label: "mixed segmented",
      options: [item],
    } as unknown as SegmentedControlProps;
    const missing = { label: "missing segmented" } as SegmentedControlProps;
    expect(() => render(<SegmentedControl {...mixed} />)).toThrow(
      /exactly one of items or options/u,
    );
    expect(() => render(<SegmentedControl {...missing} />)).toThrow(
      /exactly one of items or options/u,
    );
  });

  it("exports canonical TabItem and preserves Tabs selection, badges, and panels", () => {
    type TabValue = "overview" | "activity";
    const items = [
      {
        id: "overview",
        label: "개요",
        badge: "2",
        badgeAccessibilityLabel: "새 알림 2개",
        panel: <Text>개요 패널</Text>,
        panelAccessibilityLabel: "개요 콘텐츠",
      },
      {
        id: "activity",
        label: "활동",
        panel: <Text>활동 패널</Text>,
        panelAccessibilityLabel: "활동 콘텐츠",
      },
    ] satisfies readonly TabItem<TabValue>[];
    const onValueChange = vi.fn();
    const renderer = render(
      <Tabs
        defaultValue="overview"
        id="account"
        items={items}
        label="계정"
        mountPolicy="always"
        onValueChange={onValueChange}
      />,
    );

    expect(byLabel(renderer, "개요, 새 알림 2개").props.accessibilityState.selected)
      .toBe(true);
    act(() => byLabel(renderer, "활동").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(byLabel(renderer, "활동").props.accessibilityState.selected).toBe(true);
    expect(byLabel(renderer, "활동 콘텐츠").props).toMatchObject({
      accessibilityLabelledBy: "account-tab-activity",
      nativeID: "account-panel-activity",
      role: "tabpanel",
    });
  });

  it("preserves deprecated Tabs options and rejects mixed collection sources", () => {
    const onValueChange = vi.fn();
    const legacy = render(
      <Tabs
        defaultValue="overview"
        label="legacy tabs"
        onValueChange={onValueChange}
        options={[
          { value: "overview", label: "개요" },
          { value: "activity", label: "활동" },
        ]}
      />,
    );
    act(() => byLabel(legacy, "활동").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("activity");

    const item = { id: "overview", label: "개요" } as const;
    const option = { value: "overview", label: "개요" } as const;
    const mixed = {
      items: [item],
      label: "mixed tabs",
      options: [option],
    } as unknown as TabsProps;
    const missing = { label: "missing tabs" } as TabsProps;
    expect(() => render(<Tabs {...mixed} />)).toThrow(/exactly one of items or options/u);
    expect(() => render(<Tabs {...missing} />)).toThrow(/exactly one of items or options/u);
  });

  it("keeps canonical and deprecated Tabs sources exclusive in TypeScript", () => {
    const canonical = {
      items: [{ id: "overview", label: "개요" }],
      label: "canonical tabs",
    } satisfies TabsProps;
    const legacy = {
      label: "legacy tabs",
      options: [{ value: "overview", label: "개요" }],
    } satisfies TabsProps;
    expect(canonical.items[0]?.id).toBe("overview");
    expect(legacy.options[0]?.value).toBe("overview");

    // @ts-expect-error Tabs requires exactly one canonical or legacy collection source.
    const mixed = { items: [], label: "mixed tabs", options: [] } satisfies TabsProps;
    void mixed;
  });
});
