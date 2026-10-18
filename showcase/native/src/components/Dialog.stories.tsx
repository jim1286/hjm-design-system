import { DialogOverlayLayerPreview, ImmersiveOverlayPreview } from "../dialog-overlay-preview";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/오버레이/대화상자", component: NativeComponentPreview, args: { componentId: "dialog", variant: "default" }, parameters: { hjm: { componentIds: ["dialog"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// 1.31 Dialog companions: the decorative layer outside the card and the edge-to-edge presentation.
export const OverlayLayer: Story = { name: "카드 밖 레이어", render: () => <DialogOverlayLayerPreview /> };
export const Immersive: Story = { name: "전체 화면 표현", render: () => <ImmersiveOverlayPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
