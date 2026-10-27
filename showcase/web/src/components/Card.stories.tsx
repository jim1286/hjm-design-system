import { useState } from "react";
import { Badge, Button, Card, Icon, IconButton, Text } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Card item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--card keeps the same preview for old links.
const meta = { id: "components-data-display-card", title: "배포/컴포넌트/데이터 표시/카드", component: ContractStory, args: { name: "Card" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };

function OpenAndDeletePreview() {
  const [opened, setOpened] = useState(0);
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Text tone="muted">항공편을 삭제했어요.</Text>;
  // Whole-card open with an independent delete: the card is one target, the delete IconButton another.
  return <Card aria-label="KE123 인천에서 도쿄, 10월 20일" title="ICN → NRT" description="KE123 · 10월 20일" onActivate={() => setOpened(count => count + 1)}
    headerActions={<Button size="small" tone="ghost" onClick={() => setOpened(0)}>횟수 초기화</Button>}
    actions={<IconButton label="KE123 삭제" tone="ghost" size="small" edge="start" onClick={() => setDeleted(true)}><Icon name="delete" tone="danger" /></IconButton>}>
    <Text tone="muted" variant="label">{opened ? `${opened}번 열었어요` : "카드를 눌러 열어 보세요"}</Text>
  </Card>;
}
export const OpenWithActions: Story = { name: "열기와 따로 삭제", render: () => <OpenAndDeletePreview /> };
function BackgroundMediaPreview() {
  const [opened, setOpened] = useState(false);
  return <div style={{ height: 280, display: "flex" }}><Card layoutStyle={{ flex: 1 }} title={opened ? "여행을 열었어요" : "새로운 여행"} description="사진 위의 카드 콘텐츠"
    backgroundMedia={<div style={{ background: "linear-gradient(135deg, #376c78, #d0b585)", height: "100%" }} />}
    backgroundInteraction={<button type="button" aria-label="배경 그림 열기" onClick={() => setOpened(true)} style={{ position: "absolute", inset: 0, border: 0, background: "transparent", cursor: "pointer" }} />}
    mediaBadges={<Badge tone="info">사진</Badge>}
    badges={<Badge tone="neutral">추천</Badge>}
    actions={<Button onClick={() => setOpened(true)}>자세히 보기</Button>} /></div>;
}
export const BackgroundMedia: Story = { name: "배경 그림과 독립 행동", render: () => <BackgroundMediaPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function DestinationCardPreview() {
  const [disabled, setDisabled] = useState(false);
  return <Card href="#card-destination-example" aria-label="서울에서 온 편지" title="서울에서 온 편지" description="기본 링크 기능을 보존하는 공통 카드" disabled={disabled}
    actions={<Button tone="secondary" onClick={() => setDisabled(value => !value)}>{disabled ? "링크 활성화" : "링크 비활성화"}</Button>}>
    <Text>미리보기·새 탭·가운데 클릭은 브라우저 링크를 사용해요.</Text>
  </Card>;
}
export const DestinationLink: Story = { name: "목적지 링크 · 미게시", render: () => <DestinationCardPreview /> };

export const CornerBadge: Story = { name: "우상단 NEW 배지 · 미게시", render: () => <Card title="바다거북" description="1번 만남" badgesPlacement="corner" badges={<Badge tone="success">NEW</Badge>} /> };
