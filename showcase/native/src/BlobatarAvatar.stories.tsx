import type { Meta, StoryObj } from "@storybook/react-native";
import { Faces } from "./visual-previews";
const meta = { title: "배포/컴포넌트/데이터 표시/블로바타 캐릭터", component: Faces, parameters: { hjm: { optionalEntry: "avatar-blobatar" } } } satisfies Meta<typeof Faces>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
