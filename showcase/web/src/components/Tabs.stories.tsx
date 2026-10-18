import { useId, useMemo, useRef, useState } from "react";
import { useHjmTheme } from "@hjmds/react/provider";
import { Tabs, getTabId, getTabPanelId } from "@hjmds/react/navigation";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { filledTabsExample } from "../../../shared/navigation-layout-examples";
import { ContractStory } from "./preview-registry";

// Individual Tabs item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-navigation--tabs keeps the same preview for old links.
const meta = { id: "components-navigation-tabs", title: "배포/컴포넌트/탐색/탭", component: ContractStory, args: { name: "Tabs" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const SwipePager: Story = { name: "스와이프와 이어지는 밑줄", render: () => <SwipePagerPreview /> };
export const FilledIndicator: Story = { name: "채운 선택 표시", render: () => <FilledIndicatorPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function SwipePagerPreview() {
  const [selected, setSelected] = useState("one"), id = useId();
  const reducedMotion = useHjmTheme().environment.reducedMotion;
  const pager = useRef<HTMLDivElement>(null);
  const position = useMemo(() => {
    let current = 0; const listeners = new Set<(value: number) => void>();
    return { get: () => current, subscribe: (listener: (value: number) => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, publish: (value: number) => { current = value; listeners.forEach(listener => listener(value)); } };
  }, []);
  const items = [{ id: "one", label: "내 기록" }, { id: "two", label: "함께 보는 기록" }, { id: "three", label: "저장" }];
  return <div dir="ltr"><Tabs direction="ltr" id={id} label="기록 페이지" items={items} value={selected} onValueChange={value => { setSelected(value); const index = items.findIndex(item => item.id === value); pager.current?.scrollTo({ left: index * pager.current.clientWidth, behavior: reducedMotion ? "instant" : "smooth" }); }} renderPanels={false} swipePosition={position} />
    <div ref={pager} style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", touchAction: "pan-x pan-y" }} onScroll={event => { const node = event.currentTarget; position.publish(node.scrollLeft / Math.max(1, node.clientWidth)); }} onScrollEnd={event => { const node = event.currentTarget; setSelected(items[Math.round(node.scrollLeft / Math.max(1, node.clientWidth))]?.id ?? "one"); }}>
      {items.map(item => <div key={item.id} role="tabpanel" id={getTabPanelId(id, item.id)} aria-labelledby={getTabId(id, item.id)} aria-hidden={selected !== item.id} style={{ flex: "0 0 100%", scrollSnapAlign: "start", minHeight: 180, padding: 24, boxSizing: "border-box" }}><p>{item.label}</p><p>가로로 넘기면 밑줄이 실제 스크롤 위치를 따라갑니다.</p></div>)}
    </div></div>;
}

function FilledIndicatorPreview() {
  const [selected, setSelected] = useState<string>(filledTabsExample.initial);
  return <Tabs label={filledTabsExample.label} indicator="filled" layout="fitted" value={selected} onValueChange={setSelected}
    items={filledTabsExample.items.map(item => ({ id: item.id, label: item.label, panel: <p>{filledTabsExample.panel(item.label)}</p> }))} />;
}
