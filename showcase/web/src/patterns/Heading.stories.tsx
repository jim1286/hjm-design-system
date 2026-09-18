import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "@hjmds/react/heading";
import { Progress } from "@hjmds/react/feedback";
import { ListRow, List } from "@hjmds/react/display";
import { Stack, Section } from "@hjmds/react/layout";

/*
  Heading은 새 크기를 만들지 않는다 — foundations의 heading 스케일을 실제 heading
  요소로 꺼낼 뿐이다. 시각 크기(level)와 문서 단계(semanticLevel)를 나눠 지정할 수 있다.
*/
export function HeadingPreview() {
  return (
    <Stack gap="md">
      <Heading level="level1">랜딩 히어로 제목</Heading>
      <Heading level="level2">섹션을 여는 큰 제목</Heading>
      <Heading level="level3">본문 안의 제목</Heading>
      <Heading level="level2" semanticLevel={4}>
        크게 보이지만 문서상 h4인 카드 제목
      </Heading>
      <Heading level="level5">가장 작은 단계</Heading>
    </Stack>
  );
}

export function ProgressRingPreview() {
  return (
    <Section title="원으로 보는 진행" description="선형과 같은 값·같은 발표를 씁니다.">
      <Stack axis="inline" gap="lg" align="center" wrap>
        <Progress label="읽은 분량" value={35} valueText="35%" shape="circular">35%</Progress>
        <Progress label="오늘 목표" value={80} valueText="80%" shape="circular" tone="success" size="large">80%</Progress>
        <Progress label="불러오는 중" shape="circular" size="small" />
        <Progress label="선형 비교" value={35} valueText="35%" />
      </Stack>
    </Section>
  );
}

export function ListRowLoadingPreview() {
  return (
    <Section title="목록이 흔들리지 않게" description="자리표시 행이 실제 행과 같은 높이를 잡습니다.">
      <List label="불러오는 중인 기록">
        <ListRow loading loadingLabel="기록을 불러오는 중" title="자리" description="자리" leading={<span />} />
        <ListRow loading loadingLabel="기록을 불러오는 중" title="자리" description="자리" leading={<span />} />
        <ListRow title="느리게 걸었던 오후" description="골목을 한 바퀴 돌았어요" leading={<span />} />
      </List>
    </Section>
  );
}

const meta = { title: "Patterns/Heading", component: HeadingPreview } satisfies Meta<typeof HeadingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DisplayScale: Story = {};
export const ProgressRing: Story = { render: () => <ProgressRingPreview /> };
export const LoadingRows: Story = { render: () => <ListRowLoadingPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
