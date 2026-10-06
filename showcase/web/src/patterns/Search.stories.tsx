import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchDiscoveryPreview } from "./search-discovery-preview";
// 2026-10-06 decision: the directly assembled 내 기록 검색 was replaced by the SearchScreen-based search and
// filters (formerly 실험/화면/공통 화면/검색). This file keeps the deployed id patterns-search; the absorbed ids
// common-screen-search--* are retired in story-ids.json. Each story opens one search state directly.
const meta = { id: "patterns-search", title: "배포/화면/검색/검색 결과와 필터", component: SearchDiscoveryPreview } satisfies Meta<typeof SearchDiscoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Typing: Story = { name: "입력 중", args: { view: "typing" } };
export const Results: Story = { name: "결과", args: { view: "results" } };
export const Filtered: Story = { name: "필터 적용", args: { view: "filtered" } };
export const FilterSheet: Story = { name: "필터 시트", args: { view: "sheet" } };
export const Loading: Story = { name: "불러오는 중", args: { view: "loading" } };
// Zero results is NoResults, not Empty (docs/STORYBOOK_NAVIGATION.md §1.4).
export const NoResults: Story = { name: "결과 없음", args: { view: "empty" } };
export const Error: Story = { name: "오류", args: { view: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { view: "restricted" } };
// Dark and large text open with applied filters: idle has no rail or chips to check.
export const Dark: Story = { name: "어두운 테마", args: { view: "filtered" }, globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", args: { view: "filtered" }, globals: { textScale: "2" } };
// Recovery arms a failed next search.
export const Recovery: Story = { name: "실패와 복구", args: { view: "results", tools: true } };
