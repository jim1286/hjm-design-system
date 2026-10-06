import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileScreenPreview } from "./basic-screen-previews";
import { AvatarFacePreview } from "./ProfileStudio.previews";
// 2026-10-06 decision: 프로필 편집 (direct assembly) and the ProfileScreen-based profile showed the same edit, so they
// became one item, API-based first. This file keeps the deployed id patterns-profile-studio; the absorbed ids
// common-screen-profile--* are retired in story-ids.json. AvatarFallback keeps the old editor's default-face picker.
const meta = { id: "patterns-profile-studio", title: "배포/화면/계정/프로필", component: ProfileScreenPreview } satisfies Meta<typeof ProfileScreenPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Edit: Story = { name: "프로필 수정", args: { initialEditing: true } };
export const AvatarFallback: Story = { name: "기본 얼굴 고르기", parameters: { layout: "fullscreen" }, render: () => <AvatarFacePreview /> };
export const Loading: Story = { name: "불러오는 중", args: { stateKind: "loading" } };
export const Empty: Story = { name: "비어 있음", args: { stateKind: "empty" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { stateKind: "restricted" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const EditDark: Story = { ...Edit, name: "프로필 수정 · 어두운 테마", globals: { theme: "dark" } };
export const EditLargeText: Story = { ...Edit, name: "프로필 수정 · 큰 글자", globals: { textScale: "2" } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
