import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenLayoutPreview } from "./common-screen-previews";
const meta = { id: "common-screen-shell", title: "배포/화면/화면 틀과 도구/화면 골격과 상태", component: ScreenLayoutPreview } satisfies Meta<typeof ScreenLayoutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Loading: Story = { name: "불러오는 중", args: { stateKind: "loading" } };
export const Empty: Story = { name: "비어 있음", args: { stateKind: "empty" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { stateKind: "restricted" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 2026-10-06: 실패와 초안 복구 had no send action on this screen and was removed.
