import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SortableCollection } from "@hjmds/react/sortable";
import { SwipeActions } from "@hjmds/react/swipe-actions";
import { ContentTransition, TextTransition } from "@hjmds/react/content-transition";
import { CarouselMotion } from "@hjmds/react/carousel-motion";
import { Celebration } from "@hjmds/react/celebration";
import { Button } from "@hjmds/react/actions";
import type { SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";

import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { ListRow } from "@hjmds/react/display";

const seed = [{ id: "forest", label: "숲길" }, { id: "sea", label: "바닷가" }, { id: "cafe", label: "작은 카페" }];
const labels = {
  instructions: "스페이스로 잡고 화살표로 이동, 스페이스로 놓거나 Escape로 취소합니다.",
  dragStart: (item: SortableItem) => `${item.label} 이동 시작`, dragCancel: "이동을 취소했어요",
  handle: (item: SortableItem) => `${item.label} 순서 이동`,
  previous: (item: SortableItem) => `${item.label} 앞으로`,
  next: (item: SortableItem) => `${item.label} 뒤로`,
  position: (item: SortableItem, position: number, total: number) => `${item.label}, ${total}개 중 ${position}번째`,
};
function Demo() {
  const [items, setItems] = useState(seed);
  const [action, setAction] = useState("작업을 선택해 주세요");
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState("forest");
  const [event, setEvent] = useState(0);
  return <Container gutter="compact"><Stack gap="xl">
    <section><Heading level="level2">즐겨찾기 순서</Heading><SortableCollection items={items} label="즐겨찾기" labels={labels} renderItem={item => <strong>{item.label}</strong>}
      onCommit={intent => setItems(intent.orderedIds.map(id => seed.find(item => item.id === id)!))} /><Text>현재 순서: {items.map(item => item.label).join(" → ")}</Text></section>
    <section><Heading level="level2">목록 작업</Heading><SwipeActions label="내 기록 작업" actions={[{ id: "archive", label: "보관" }, { id: "delete", label: "삭제", intent: "danger", disabled: true }]}
      onAction={id => setAction(id === "archive" ? "보관했어요" : id)} onError={() => setAction("다시 시도해 주세요")}><ListRow title="오늘 걸었던 숲길" /></SwipeActions><Text role="status">{action}</Text></section>
    <section><Heading level="level2">내용 전환</Heading><Button tone="secondary" onClick={() => setStep(value => value + 1)}>다음 상태</Button>
      <ContentTransition stateKey={String(step)}><Heading level="level3">{step % 2 ? "기록이 준비됐어요" : "새로운 기록을 시작해요"}</Heading></ContentTransition>
      <TextTransition text={step % 2 ? "저장 완료 👨‍👩‍👧‍👦" : "나만의 하루 🌿"} /></section>
    <section><Heading level="level2">카드 탐색</Heading><CarouselMotion slides={seed} currentKey={slide} onCurrentKeyChange={setSlide} label="추천 장소" previousLabel="이전 장소" nextLabel="다음 장소"
      renderSlide={item => <div style={{ minHeight: 160, display: "grid", placeItems: "center", background: "var(--hjm-color-surface)", border: "var(--hjm-field-border-width) solid var(--hjm-color-border)", borderRadius: "var(--hjm-radius-lg)" }}><Heading level="level3">{item.label}</Heading></div>} /></section>
    <section><Heading level="level2">목표 달성</Heading><Button tone="secondary" onClick={() => setEvent(value => value + 1)}>기록 달성 축하</Button>{event > 0 ? <><Text role="status">{event}번째 기록을 남겼어요</Text><Celebration eventId={`record-${event}`} /></> : null}</section>
  </Stack></Container>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "experimental-interaction-adapters", title: "배포/구성/직접 조작과 모션/끌기·밀기·화면 전환", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
