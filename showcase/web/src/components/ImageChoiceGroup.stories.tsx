import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual ImageChoiceGroup item (2026-10-17): registered in the catalog as a beta input with its own radio/checkbox semantics.
const meta = { id: "components-inputs-imagechoicegroup", title: "배포/컴포넌트/입력/이미지 선택", component: ContractStory, args: { name: "ImageChoiceGroup" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
