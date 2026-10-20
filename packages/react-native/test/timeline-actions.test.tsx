import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { expect, it, vi } from "vitest";
import { Timeline } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("lets a virtual host mount only visible shared records while keeping commands accessible", () => {
  const restore = vi.fn(); let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Timeline
    items={Array.from({ length: 200 }, (_, n) => ({ id: String(n), label: `Version ${n}`, description: "Existing change", timestamp: "Today", emphasized: n === 100 }))}
    composeAccessibleName={({ position, total, label }) => `${position}/${total}: ${label}`}
    renderMetadata={() => <View testID="badge" />}
    renderActions={item => <Pressable accessibilityLabel={`Restore ${item.id}`} onPress={restore} />}
    renderList={({ items, renderItem }) => <View testID="virtual-host">{renderItem(items[100]!, 100)}</View>}
  /></HjmNativeProvider>); });
  expect(renderer.root.findAllByType(Pressable)).toHaveLength(1);
  const command = renderer.root.findByType(Pressable);
  expect(command.props.accessibilityLabel).toBe("Restore 100");
  expect(renderer.root.findAllByType(View).filter(node => node.props.testID === "badge")).toHaveLength(1);
  expect(renderer.root.findAll(node => node.props.accessible === true && node.props.accessibilityLabel === "101/200: Version 100, Existing change, Today").length).toBeGreaterThan(0);
  for (let parent = command.parent; parent; parent = parent.parent) expect(parent.props.accessible).not.toBe(true);
  act(() => command.props.onPress()); expect(restore).toHaveBeenCalledOnce();
  act(() => renderer.unmount());
});
