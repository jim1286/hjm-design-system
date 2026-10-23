import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/화면 제목과 설명", component: NativeComponentPreview, args: { componentId: "top", variant: "default" }, parameters: { hjm: { componentIds: ["top"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Top } from '@hjmds/react-native/top';
// titleLineBreaks="preserve" (2026-10-23): an intended hero break; the heading name stays one sentence (portfolio site).
export const PreservedLineBreak: Story = { name: '의도한 줄바꿈', render: () => <Top descriptor={{ eyebrow: '제품 개발자', title: '아이디어를 제품으로,\n제품을 오래 쓰이는 구조로.', titleLineBreaks: 'preserve' }} /> };
