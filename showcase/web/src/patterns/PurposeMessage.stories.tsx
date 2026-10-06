import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComposerPreview } from "./conversation-previews";
const meta = { id: "purpose-input-message", title: "배포/구성/입력과 작성/메시지 작성", component: ComposerPreview, args: {purpose:"message"} } satisfies Meta<typeof ComposerPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {name:"기본"};
// Merged from 공통 화면/메시지 작성 (2026-10-06): several photos sent in one message.
export const Photos: Story = {name:"여러 사진 전송",args:{initialPhotos:2}};
export const Pending: Story = {name:"처리 중",args:{initialState:"pending"}};
export const Failed: Story = {name:"실패 후 입력 유지",args:{initialState:"error"}};
export const Dark: Story = {name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = {name:"큰 글자",globals:{textScale:"2"}};
export const BrandViolet: Story = {name:"제품 색 · 보라",args:{brand:"violet"}};
export const BrandGreenDark: Story = {name:"제품 색 · 초록 · 어두운 테마",args:{brand:"green"},globals:{theme:"dark"}};
