import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
import { MediaSelectionJobPreview } from "../media-selection-job";
const meta = { title: "배포/컴포넌트/레이아웃/미디어 선택 화면", component: NativeComponentPreview, args: { componentId: "media-selection-screen", variant: "default" }, parameters: { hjm: { componentIds: ["media-selection-screen"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// HJM 1.32 `disabled`: held in the running state, where the host job locks move/rotate/remove and the primary action is pending.
export const Pending: Story = { name: "처리 중", render: () => <MediaSelectionJobPreview running /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
