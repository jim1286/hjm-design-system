import type { Meta, StoryObj } from "@storybook/react-native";
import { Carousel } from "@hjmds/react-native/carousel";
import { Surface, Stack, Text } from "@hjmds/react-native/primitives";

const meta = {
  title: "배포/컴포넌트/데이터 표시/캐러셀", parameters: { hjm: { componentIds: ["carousel"] } },
  component: Carousel,
  args: {
    label: "내 기록 활용하기",
    slides: [{ id: "remember", label: "오늘을 기억해요" }, { id: "find", label: "원하는 순간을 찾아요" }, { id: "keep", label: "내 방식대로 간직해요" }],
    labels: { previous: "이전", next: "다음", pause: "자동 넘김 멈추기", resume: "자동 넘김 시작하기", navigation: "기록 안내 이동" },
    composeAccessibleName: ({ position, total, label }) => `${position}/${total} ${label}`,
    renderSlide: ({ label }) => <Surface padding="md" bordered><Stack gap="sm">
      <Text variant="title" emphasis="strong">{label}</Text>
      <Text tone="muted">작은 기록부터 시작해 보세요. 다음 카드로 넘어가도 읽던 순서를 알 수 있어요.</Text>
    </Stack></Surface>,
  },
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Manual: Story = { name: "수동 재생",};
export const OptionalAutoplay: Story = { name: "자동 재생 연동", args: { autoplay: { intervalMs: 5000 } } };

export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
