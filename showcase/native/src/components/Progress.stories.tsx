import { Progress } from "@hjmds/react-native/feedback";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/상태와 알림/진행 표시", component: NativeComponentPreview, args: { componentId: "progress", variant: "default" }, parameters: { hjm: { componentIds: ["progress"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const CountLabel: Story = { name: "라벨에 수량 포함 · 미게시", render: () => <Progress label="만난 친구 1/30" value={1} max={30} showValue={false} /> };

export const ActivityUnits: Story = { name: "활동 단위 · 미게시", render: () => <Progress label="선물까지 모은 활동일 · 2/5" value={2} max={5} segments={5} showValue={false} /> };
