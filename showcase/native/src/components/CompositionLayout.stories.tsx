import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/구성 골격", component: NativeComponentPreview, args: { componentId: "composition-layout", variant: "default" }, parameters: { hjm: { componentIds: ["composition-layout"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { CompositionLayout } from '@hjmds/react-native/screens';
import { Text } from '@hjmds/react-native/primitives';
import { Badge } from '@hjmds/react-native/data-display';
import { View } from 'react-native';
export const SupportingArtwork: Story = { name: '본문 옆 보조 그림', render: () => <CompositionLayout title="보낸 사람" titleSize="compact" description="출발 도시"
  aside={<View style={{width: 72, height: 112}}><Text>보조 그림</Text></View>}
  footer={<Text variant="caption">배달 친구 · 어제</Text>} footerAside={<Badge size="small" variant="outline" label="전달 완료" />}>
  <Text>제목과 본문은 그림 옆의 남은 폭에서 자연스럽게 줄바꿈합니다.</Text>
</CompositionLayout> };
// stateHeight (2026-10-23): the empty/loading/error replacement keeps its own room and centers without a parent height.
export const StateHeight: Story = { name: '상태 영역 높이', render: () => <CompositionLayout title="박스스코어" stateHeight="regular"
  state={{ kind: 'empty', title: '아직 기록이 없어요' }}><Text>표</Text></CompositionLayout> };
