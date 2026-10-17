import type { Meta, StoryObj } from "@storybook/react-native";
import { Toast } from "@hjmds/react-native/feedback";
import { Stack } from "@hjmds/react-native/primitives";
import type { ToastDescriptor } from "@hjmds/design-contracts/components/toast";
import { Bell, Check, Info, OctagonAlert, TriangleAlert } from "lucide-react-native";
import { toastLayoutExamples as examples } from "../../shared/toast-layout";

// Same cards as the Web layout comparison (shared descriptors). Toast is Native stable, so the
// badge/title/close/action placement is compared on both renderers (2026-10-17 review).
// Without the optional liquid entry, a "liquid" descriptor falls back to the standard card.
// Native leaves tone glyphs to the product; these are the same marks Web draws in its badge.
const toneGlyphs = { neutral: Bell, success: Check, info: Info, warning: TriangleAlert, danger: OctagonAlert } as const;
function ToastLayoutPreview({ descriptors }: { descriptors: readonly ToastDescriptor[] }) {
  return <Stack gap="sm">{descriptors.map(descriptor => <Toast key={descriptor.id} descriptor={descriptor}
    renderToneIcon={({ color, size, tone }) => { const Glyph = toneGlyphs[tone]; return <Glyph accessible={false} color={color} size={size} />; }} />)}</Stack>;
}
const meta = { title: "배포/구성/비교와 검증/토스트 배치 비교", component: ToastLayoutPreview, args: { descriptors: [examples.compact] } } satisfies Meta<typeof ToastLayoutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const LiquidHintFallback: Story = { name: "리퀴드 효과 대체 표시", args: { descriptors: [examples.liquid] } };
export const LongCopyWithAction: Story = { name: "긴 문구와 실행 버튼", args: { descriptors: [examples.longCopy] }, globals: { textScale: "2" } };
export const ToneGallery: Story = { name: "상태별 비교", args: { descriptors: examples.tones } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
