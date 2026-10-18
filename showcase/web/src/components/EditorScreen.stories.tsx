import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { EditorStepBackPreview } from "../patterns/flow-variants.previews.js";

// Individual EditorScreen item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--editor-screen keeps the same preview for old links.
const meta = { id: "components-layout-editor-screen", title: "배포/컴포넌트/레이아웃/편집 화면", component: ContractStory, args: { name: "EditorScreen" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const StepBack: Story = { name: "단계 뒤로 가기", render: () => <EditorStepBackPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
