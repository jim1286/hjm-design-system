import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "@hjmds/react/toast";

const meta = {
  title: "Patterns/Toast layout",
  component: Toast,
  args: {
    descriptor: { id: "saved", description: "저장했어요", closeLabel: "닫기" },
    onDismissRequest: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// Use a compact viewport to exercise the same responsive rule as the product.
// A narrow parent in a desktop viewport alone does not activate that rule.
export const Compact: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

// A shared product descriptor keeps its action on Web without loading Native liquid dependencies.
export const LiquidHintFallback: Story = {
  args: { descriptor: { id: "generation-ready", presentation: "liquid", title: "아이디어가 완성됐어요",
    description: "결과를 확인해 보세요.", closeLabel: "완료 알림 닫기", tone: "success",
    action: { label: "결과 열기", onAction: () => {} } } },
};

export const LongCopyWithAction: Story = {
  ...Compact,
  globals: { ...Compact.globals, textScale: "2" },
  args: {
    descriptor: {
      id: "retry",
      title: "연결을 확인해 주세요",
      description: "Your changes remain available. 연결이 복구되면 다시 시도할 수 있어요.",
      closeLabel: "알림 닫기",
      action: { label: "다시 시도하기 Try again", onAction: () => {}, dismissOnAction: false },
    },
  },
};

// 1.10.0 refresh review: every tone badge, with and without an action, in one frame (docs/toast.md).
export const ToneGallery: Story = {
  ...Compact,
  render: () => (
    <div style={{ display: "grid", gap: "var(--hjm-space-sm)" }}>
      <Toast descriptor={{ id: "g-neutral", title: "검토하고 있어요", description: "다 되면 알려 드릴게요. 그동안 써 보셔도 돼요.", closeLabel: "닫기" }} onDismissRequest={() => {}} />
      <Toast descriptor={{ id: "g-success", tone: "success", title: "검토 완료", description: "번뚝 타이머를 다듬었어요. 새 버전으로 저장할까요?", closeLabel: "닫기", action: { label: "새 버전으로 저장", onAction: () => {} } }} onDismissRequest={() => {}} />
      <Toast descriptor={{ id: "g-info", tone: "info", description: "새 버전으로 저장했어요", closeLabel: "닫기" }} onDismissRequest={() => {}} />
      <Toast descriptor={{ id: "g-warning", tone: "warning", title: "연결이 불안정해요", description: "잠시 후 다시 시도해 주세요.", closeLabel: "닫기" }} onDismissRequest={() => {}} />
      <Toast descriptor={{ id: "g-danger", tone: "danger", description: "저장하지 못했어요", closeLabel: "닫기", action: { label: "다시 시도", onAction: () => {} } }} onDismissRequest={() => {}} />
    </div>
  ),
};
