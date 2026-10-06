import type { Meta, StoryObj } from "@storybook/react-native";
import { NavigationBehaviorPreview } from "./reference-navigation-bars";
// 2026-10-06: the four navigation bar behaviors were separate depth-5 menu items. The Storybook spec allows no folder
// under an item, so the behaviors are stories of one item; Default keeps the center action (FINAL_MAPPING §2).
const meta = { title: "배포/컴포넌트/탐색/내비게이션 바", component: NavigationBehaviorPreview, parameters: { controls: { disable: true } }, args: { behavior: "center" } } satisfies Meta<typeof NavigationBehaviorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Cycle: Story = { name: "탐색 옆에서 작업 실행", args: { behavior: "separate" } };
export const Finance: Story = { name: "선택한 목적지 이름 표시", args: { behavior: "label" } };
export const Project: Story = { name: "사각 영역으로 현재 위치 표시", args: { behavior: "rectangle" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const CycleDark: Story = { ...Cycle, name: "탐색 옆에서 작업 실행 · 어두운 테마", globals: { theme: "dark" } };
export const CycleLargeText: Story = { ...Cycle, name: "탐색 옆에서 작업 실행 · 큰 글자", globals: { textScale: "2" } };
export const FinanceDark: Story = { ...Finance, name: "선택한 목적지 이름 표시 · 어두운 테마", globals: { theme: "dark" } };
export const FinanceLargeText: Story = { ...Finance, name: "선택한 목적지 이름 표시 · 큰 글자", globals: { textScale: "2" } };
export const ProjectDark: Story = { ...Project, name: "사각 영역으로 현재 위치 표시 · 어두운 테마", globals: { theme: "dark" } };
export const ProjectLargeText: Story = { ...Project, name: "사각 영역으로 현재 위치 표시 · 큰 글자", globals: { textScale: "2" } };
