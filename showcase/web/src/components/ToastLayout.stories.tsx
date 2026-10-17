import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "@hjmds/react/toast";
import { Stack } from "@hjmds/react/layout";
import { toastLayoutExamples as examples } from "../../../shared/toast-layout";

const meta = { includeStories: ["Default","LiquidHintFallback","LongCopyWithAction","ToneGallery","Dark","LargeText"],
  id: "patterns-toast-layout", title: "배포/구성/비교와 검증/토스트 배치 비교",
  component: Toast,
  args: {
    descriptor: examples.compact,
    onDismissRequest: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// Use a compact viewport to exercise the same responsive rule as the product.
// A narrow parent in a desktop viewport alone does not activate that rule.
export const Default: Story = { name: "기본",
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

// A shared product descriptor keeps its action on Web without loading Native liquid dependencies.
export const LiquidHintFallback: Story = { name: "리퀴드 효과 대체 표시",
  args: { descriptor: examples.liquid },
};

export const LongCopyWithAction: Story = {
  ...Default,
  // name after the spread: `{ name, ...Default }` let the spread overwrite it (2026-10-06 three "간결한 배치" entries).
  name: "긴 문구와 실행 버튼",
  globals: { ...Default.globals, textScale: "2" },
  args: { descriptor: examples.longCopy },
};

// 1.10.0 refresh review: every tone badge, with and without an action, in one frame (docs/toast.md).
export const ToneGallery: Story = {
  ...Default,
  name: "상태별 비교",
  render: () => (
    <Stack gap="sm">
      {examples.tones.map(descriptor => <Toast key={descriptor.id} descriptor={descriptor} onDismissRequest={() => {}} />)}
    </Stack>
  ),
};

export const Dark: Story = { ...Default, name: "어두운 테마", globals: { ...Default.globals, theme: "dark" } };
export const LargeText: Story = { ...Default, name: "큰 글자", globals: { ...Default.globals, textScale: "2" } };
