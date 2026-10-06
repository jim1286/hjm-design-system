import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Surface","Divider","Section","Stack","Container","AspectRatio","Grid","Layout","Top","Masonry","Splitter","AuthScreenLayout"], id: "components-layout", title: "배포/컴포넌트/개요/레이아웃 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Surface: Story = { ...componentStory("Surface"), name: "배경 영역" };
export const Divider: Story = { ...componentStory("Divider"), name: "구분선" };
export const Section: Story = { ...componentStory("Section"), name: "섹션" };
export const Stack: Story = { ...componentStory("Stack"), name: "가로·세로 배치" };
export const Container: Story = { ...componentStory("Container"), name: "컨테이너" };
export const AspectRatio: Story = { ...componentStory("AspectRatio"), name: "화면 비율" };
export const Grid: Story = { ...componentStory("Grid"), name: "격자" };
export const Layout: Story = { ...componentStory("Layout"), name: "화면 기본 구조" };
export const Top: Story = { ...componentStory("Top"), name: "화면 제목과 설명" };
export const Masonry: Story = { ...componentStory("Masonry"), name: "높이가 다른 카드 배치" };
export const Splitter: Story = { ...componentStory("Splitter"), name: "분할 영역 조절" };
export const AuthScreenLayout: Story = { ...componentStory("AuthScreenLayout"), name: "로그인 화면" };
