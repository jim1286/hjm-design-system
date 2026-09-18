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
