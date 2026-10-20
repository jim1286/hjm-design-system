import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { BottomCTA, Dialog, Text } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual BottomCTA item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-actions--bottom-cta keeps the same preview for old links.
const meta = { id: "components-actions-bottom-cta", title: "배포/컴포넌트/동작/하단 실행 버튼", component: ContractStory, args: { name: "BottomCTA" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };

function FocusReturnPreview() {
  const [open, setOpen] = useState(false);
  // The action's buttonRef is the button itself; the component ref would be the bar.
  const start = useRef<HTMLButtonElement>(null);
  return <div style={{ display: "grid", gap: 12 }}>
    <Text tone="muted">시작을 눌러 연 창을 닫으면 포커스가 시작 버튼으로 돌아와요.</Text>
    <BottomCTA primaryAction={{ label: "전광판 시작", leading: <Play aria-hidden="true" size={16} />, onClick: () => setOpen(true), buttonRef: start }} />
    <Dialog open={open} onOpenChange={setOpen} title="전광판" closeLabel="전광판 닫기" returnFocusRef={start}>
      <Text>오늘도 좋은 하루</Text>
    </Dialog>
  </div>;
}
export const FocusReturn: Story = { name: "닫은 뒤 포커스 복귀", render: () => <FocusReturnPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
