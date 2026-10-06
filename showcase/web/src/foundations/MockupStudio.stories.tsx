import type { Meta, StoryObj } from "@storybook/react-vite";
import { MockupStudio } from "../studio/MockupStudio";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "foundations-mockup-studio", title: "배포/화면/화면 틀과 도구/목업 편집", component: MockupStudio } satisfies Meta<typeof MockupStudio>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
