import { Card, StatisticGroup } from "@hjmds/react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/수치 표시", component: NativeComponentPreview, args: { componentId: "statistic", variant: "default" }, parameters: { hjm: { componentIds: ["statistic"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Bar: Story = { name: "한 줄 통계 바", render: () => <Card padding="sm"><StatisticGroup label="활동 요약" arrangement="bar"
  descriptor={{ items: [{ id: "views", label: "조회", value: "120" }, { id: "comments", label: "댓글", value: "0" }, { id: "shares", label: "공유", value: "8" }] }} /></Card> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
