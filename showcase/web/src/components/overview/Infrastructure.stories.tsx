import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Affix","DesignSystemProvider","SkipNav","VisuallyHidden"], id: "components-infrastructure", title: "배포/컴포넌트/개요/기반 기능 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Affix: Story = { ...componentStory("Affix"), name: "고정 배치" };
export const DesignSystemProvider: Story = { ...componentStory("DesignSystemProvider"), name: "디자인 시스템 설정" };
export const SkipNav: Story = { ...componentStory("SkipNav"), name: "본문 바로가기" };
export const VisuallyHidden: Story = { ...componentStory("VisuallyHidden"), name: "화면 읽기 도구용 글자" };
