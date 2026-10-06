import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebAdditionsPreview } from "./WebAdditions.previews.js";

const meta = { includeStories: ["Default","MarkDocument","StickyAction","Dark","LargeText"], id: "patterns-web-additions", title: "배포/구성/비교와 검증/웹 전용 보조 컴포넌트", component: WebAdditionsPreview } satisfies Meta<typeof WebAdditionsPreview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const MarkDocument: StoryObj<typeof meta> = { name: "문서 표시", args: { mode: "watermark" } };
export const StickyAction: StoryObj<typeof meta> = { name: "고정 실행 영역", args: { mode: "affix" } };
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
