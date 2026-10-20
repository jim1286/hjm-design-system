import { Sheet } from "@hjmds/react/overlays";
import { Button } from "@hjmds/react/actions";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Sheet item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-overlays--sheet keeps the same preview for old links.
const meta = { id: "components-overlays-sheet", title: "배포/컴포넌트/오버레이/시트", component: ContractStory, args: { name: "Sheet" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const ReadingPanel: Story = { name: "아래로 닫는 옆 읽기 패널 · 미게시", render: () => (
  <Sheet placement="end" swipeDirection="down" showClose={false} title="편지" closeLabel="편지 닫기" trigger={<Button>편지 읽기</Button>}>
    <p>본문은 스크롤하고, 위 손잡이를 아래로 끌거나 눌러 닫으세요.</p>
  </Sheet>
) };
