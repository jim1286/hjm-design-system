import { useId, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Tabs, getTabId, getTabPanelId } from "@hjmds/react-native/navigation";
import { Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/탐색/탭", component: NativeComponentPreview, args: { componentId: "tabs", variant: "default" }, parameters: { hjm: { componentIds: ["tabs"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const SwipePager: Story = { name: "스와이프와 이어지는 밑줄", render: () => <SwipePagerPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function SwipePagerPreview() {
  const [selected, setSelected] = useState("one"), [width, setWidth] = useState(320), id = useId();
  const pager = useRef<ScrollView>(null);
  const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
  const position = useMemo(() => {
    let current = 0; const listeners = new Set<(value: number) => void>();
    return { get: () => current, subscribe: (listener: (value: number) => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, publish: (value: number) => { current = value; listeners.forEach(listener => listener(value)); } };
  }, []);
  const items = [{ id: "one", label: "내 기록" }, { id: "two", label: "함께 보는 기록" }, { id: "three", label: "저장" }];
  return <View style={{ direction: "ltr" }}><Tabs direction="ltr" id={id} label="기록 페이지" items={items} value={selected} onValueChange={value => { setSelected(value); pager.current?.scrollTo({ x: items.findIndex(item => item.id === value) * width, animated: !reducedMotion }); }} renderPanels={false} swipePosition={position} />
    <ScrollView ref={pager} horizontal pagingEnabled nestedScrollEnabled scrollEventThrottle={16} onLayout={event => setWidth(event.nativeEvent.layout.width)} onScroll={event => position.publish(event.nativeEvent.contentOffset.x / Math.max(1, width))} onMomentumScrollEnd={event => setSelected(items[Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width))]?.id ?? "one")}>
      {items.map(item => <View key={item.id} role="tabpanel" nativeID={getTabPanelId(id, item.id)} accessibilityLabelledBy={getTabId(id, item.id)} accessibilityElementsHidden={selected !== item.id} importantForAccessibility={selected === item.id ? "auto" : "no-hide-descendants"} style={{ width, minHeight: 180, padding: 24 }}><Text>{item.label}</Text><Text>가로로 넘기면 밑줄이 실제 스크롤 위치를 따라갑니다.</Text></View>)}
    </ScrollView></View>;
}
