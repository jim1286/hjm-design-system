import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuoteCard, Text } from "@hjmds/react";
function Demo() { return <QuoteCard attribution="작성자 · 오늘"><Text>함께 떠올린 생각을 기록해 주세요.</Text></QuoteCard>; }
const meta = { title: "실험/컴포넌트/데이터 표시/인용 카드", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const LargeText: Story = { globals: { textScale: "2" } };
