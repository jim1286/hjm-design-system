import type { Meta, StoryObj } from "@storybook/react-vite";
import { LatestSearchWins } from "./interaction-flow-previews";
const meta = { includeStories: ["Default","Pending","Error","Dark","LargeText","BrandViolet","BrandGreenDark"], id: "experimental-interaction-search", title: "배포/구성/입력과 작성/늦은 응답보다 최신 검색 유지", component: LatestSearchWins } satisfies Meta<typeof LatestSearchWins>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", args: { initialState: "pending" } };
export const Error: Story = { name: "오류", args: { initialState: "error" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// Merged from 입력과 작성/검색 입력 (2026-10-06): the same SearchField busy state under product palettes.
export const BrandViolet: Story = { name: "제품 색 · 보라", args: { brand: "violet" } };
export const BrandGreenDark: Story = { name: "제품 색 · 초록 · 어두운 테마", args: { brand: "green" }, globals: { theme: "dark" } };
