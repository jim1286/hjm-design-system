import type { Meta, StoryObj } from "@storybook/react-native";
import { SearchDiscoveryPreview } from "./search-discovery-preview";
// 2026-10-06: the released hand-assembled search (내 기록 검색) and the experimental SearchScreen-based 검색 showed the
// same task, so this item now uses the SearchScreen preview and its stories (FINAL_MAPPING §2).
// Each story opens one search state directly (still screens for comparison).
const meta = { title: "배포/화면/검색/검색 결과와 필터", component: SearchDiscoveryPreview } satisfies Meta<typeof SearchDiscoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Typing: Story = { name: "입력 중", args: { view: "typing" } };
export const Results: Story = { name: "결과", args: { view: "results" } };
export const Filtered: Story = { name: "필터 적용", args: { view: "filtered" } };
export const FilterSheet: Story = { name: "필터 시트", args: { view: "sheet" } };
export const Loading: Story = { name: "불러오는 중", args: { view: "loading" } };
// Zero matches for a query, not an empty collection, so it uses NoResults rather than Empty.
export const NoResults: Story = { name: "결과 없음", args: { view: "empty" } };
export const Error: Story = { name: "오류", args: { view: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { view: "restricted" } };
// Dark and large text open with applied filters: idle has no rail or chips to check.
export const Dark: Story = { name: "어두운 테마", args: { view: "filtered" }, globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", args: { view: "filtered" }, globals: { textScale: "2" } };
// Recovery arms a failed next search from the results view.
export const Recovery: Story = { name: "실패와 복구", args: { view: "results", tools: true } };
