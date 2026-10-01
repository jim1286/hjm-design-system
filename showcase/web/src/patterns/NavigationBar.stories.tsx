import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlassPreview } from "./navigation-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-navigation-navigationbar", title: "배포/컴포넌트/탐색/검색·메뉴가 있는 상단 바", component: GlassPreview } satisfies Meta<typeof GlassPreview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
