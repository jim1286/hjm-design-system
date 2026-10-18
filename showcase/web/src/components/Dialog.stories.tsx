import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { DialogOverlayLayerPreview, ImmersiveOverlayPreview } from "./dialog-overlay-examples";

// Individual Dialog item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-overlays--dialog keeps the same preview for old links.
const meta = { id: "components-overlays-dialog", title: "배포/컴포넌트/오버레이/대화상자", component: ContractStory, args: { name: "Dialog" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// 1.31 Dialog companions: the decorative layer outside the card and the edge-to-edge presentation.
export const OverlayLayer: Story = { name: "카드 밖 레이어", render: () => <DialogOverlayLayerPreview /> };
export const Immersive: Story = { name: "전체 화면 표현", render: () => <ImmersiveOverlayPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
