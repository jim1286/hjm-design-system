import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
import { CategoryFilterPreview } from "../category-filter-preview";
const meta = { title: "배포/컴포넌트/입력/버튼형 선택", component: NativeComponentPreview, args: { componentId: "segmented-control", variant: "default" }, parameters: { hjm: { componentIds: ["segmented-control"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// 2026-10-06: the experimental 카테고리 필터 item was the same SegmentedControl with presentation="pills",
// so it became these two stories instead of a separate menu item (FINAL_MAPPING §2).
export const Pills: Story = { name: "알약 모양", render: () => <CategoryFilterPreview /> };
export const Disabled: Story = { name: "비활성", render: () => <CategoryFilterPreview disabled /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
