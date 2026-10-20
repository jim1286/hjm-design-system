import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuoteCard, Text } from "@hjmds/react";
function Demo() { return <QuoteCard attribution="작성자 · 오늘"><Text>함께 떠올린 생각을 기록해 주세요.</Text></QuoteCard>; }
// Keep existing story URLs when promoting the navigation section.
const meta = { id: "실험-컴포넌트-데이터-표시-인용-카드", title: "배포/컴포넌트/데이터 표시/인용 카드", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글씨", globals: { textScale: "2" } };
