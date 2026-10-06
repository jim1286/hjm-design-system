import type { Meta, StoryObj } from "@storybook/react-native";
import { ProfileScreenPreview } from "./basic-screen-previews";
import { ProfileFacePreview } from "./profile-face-preview";
// 2026-10-06: the released hand-assembled 프로필 편집 and the experimental ProfileScreen-based 프로필 showed the same
// editing task. The API-based screen wins; the face picker unique to the old editor stays as AvatarFallback
// (FINAL_MAPPING §2). The file name is kept so history and the Web counterpart stay easy to find.
const meta = { title: "배포/화면/계정/프로필", component: ProfileScreenPreview } satisfies Meta<typeof ProfileScreenPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Edit: Story = { name: "프로필 수정", args: { initialEditing: true } };
export const AvatarFallback: Story = { name: "기본 얼굴 고르기", render: () => <ProfileFacePreview /> };
export const Loading: Story = { name: "불러오는 중", args: { stateKind: "loading" } };
export const Empty: Story = { name: "비어 있음", args: { stateKind: "empty" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { stateKind: "restricted" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const EditDark: Story = { ...Edit, name: "프로필 수정 · 어두운 테마", globals: { theme: "dark" } };
export const EditLargeText: Story = { ...Edit, name: "프로필 수정 · 큰 글자", globals: { textScale: "2" } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
