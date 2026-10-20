import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { Badge, Button, Card, Icon, IconButton, Text } from "@hjmds/react-native";
import { renderSemanticGlyph } from "@hjmds/react-native/icon-svg";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/카드", component: NativeComponentPreview, args: { componentId: "card", variant: "default" }, parameters: { hjm: { componentIds: ["card"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

function OpenAndDeletePreview() {
  const [opened, setOpened] = useState(0);
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Text tone="muted">항공편을 삭제했어요.</Text>;
  // Whole-card open with an independent delete: media/body is one Pressable, the delete IconButton a sibling target.
  return <Card accessibilityLabel="KE123 인천에서 도쿄, 10월 20일" title="ICN → NRT" description="KE123 · 10월 20일" onActivate={() => setOpened(count => count + 1)}
    headerActions={<Button size="small" tone="ghost" onPress={() => setOpened(0)}>횟수 초기화</Button>}
    actions={<IconButton label="KE123 삭제" tone="ghost" size="small" edge="start" onPress={() => setDeleted(true)}><Icon descriptor={{ name: "delete", tone: "danger" }} renderGlyph={renderSemanticGlyph} /></IconButton>}>
    <Text tone="muted" variant="label">{opened ? `${opened}번 열었어요` : "카드를 눌러 열어 보세요"}</Text>
  </Card>;
}
export const OpenWithActions: Story = { name: "열기와 따로 삭제", render: () => <OpenAndDeletePreview /> };
function BackgroundMediaPreview() {
  const [opened, setOpened] = useState(false);
  return <View style={{ height: 280 }}><Card layoutStyle={{ flex: 1 }} title={opened ? "여행을 열었어요" : "새로운 여행"} description="사진 위의 카드 콘텐츠"
    backgroundMedia={<View style={{ flex: 1, backgroundColor: "#376c78" }} />}
    backgroundInteraction={<Pressable accessibilityLabel="배경 그림 열기" accessibilityRole="button" onPress={() => setOpened(true)} style={StyleSheet.absoluteFill} />}
    mediaBadges={<Badge label="사진" tone="info" />}
    badges={<Badge label="추천" tone="neutral" />}
    actions={<Button onPress={() => setOpened(true)}>자세히 보기</Button>} /></View>;
}
export const BackgroundMedia: Story = { name: "배경 그림과 독립 행동", render: () => <BackgroundMediaPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
