import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginScreenPreview } from "./common-screen-previews";
const meta = { id: "common-screen-login", title: "배포/화면/계정/로그인", component: LoginScreenPreview } satisfies Meta<typeof LoginScreenPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// Login "loading" is a provider sign-in in progress (pendingLabel), not an initial fetch (LS-09).
export const Pending: Story = { name: "처리 중", args: { stateKind: "loading" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 2026-10-06: 새 소식 없음·로그인 필요·실패와 초안 복구 rendered the default login screen unchanged and were removed.
