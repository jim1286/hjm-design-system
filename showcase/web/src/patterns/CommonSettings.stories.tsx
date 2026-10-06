import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsScreenPreview } from "./common-screen-previews";
const meta = { id: "common-screen-settings", title: "배포/화면/설정/앱 설정", component: SettingsScreenPreview } satisfies Meta<typeof SettingsScreenPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Loading: Story = { name: "불러오는 중", args: { stateKind: "loading" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { stateKind: "restricted" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 2026-10-06: 새 계정 기본 설정·선택과 프로필 수정 had no args (same as 기본) and were removed.
