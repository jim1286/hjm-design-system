import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SortableCollection } from "@hjmds/react/sortable";
import { SwipeActions } from "@hjmds/react/swipe-actions";
import { ContentTransition, TextTransition } from "@hjmds/react/content-transition";
import { CarouselMotion } from "@hjmds/react/carousel-motion";
import { Celebration } from "@hjmds/react/celebration";
import { Button } from "@hjmds/react/actions";
import type { SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";

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
  return <div style={{ display: "grid", gap: "var(--hjm-space-xl)", maxWidth: 640 }}>
    <section><h2>즐겨찾기 순서</h2><SortableCollection items={items} label="즐겨찾기" labels={labels} renderItem={item => <strong>{item.label}</strong>}
      onCommit={intent => setItems(intent.orderedIds.map(id => seed.find(item => item.id === id)!))} /><p>현재 순서: {items.map(item => item.label).join(" → ")}</p></section>
    <section><h2>목록 작업</h2><SwipeActions label="내 기록 작업" actions={[{ id: "archive", label: "보관" }, { id: "delete", label: "삭제", intent: "danger", disabled: true }]}
      onAction={id => setAction(id === "archive" ? "보관했어요" : id)} onError={() => setAction("다시 시도해 주세요")}><p>오늘 걸었던 숲길</p></SwipeActions><p role="status">{action}</p></section>
    <section><h2>내용 전환</h2><Button onClick={() => setStep(value => value + 1)}>다음 상태</Button>
      <ContentTransition stateKey={String(step)}><h3>{step % 2 ? "기록이 준비됐어요" : "새로운 기록을 시작해요"}</h3></ContentTransition>
      <TextTransition text={step % 2 ? "저장 완료 👨‍👩‍👧‍👦" : "나만의 하루 🌿"} /></section>
    <section><h2>카드 탐색</h2><CarouselMotion slides={seed} currentKey={slide} onCurrentKeyChange={setSlide} label="추천 장소" previousLabel="이전 장소" nextLabel="다음 장소"
      renderSlide={item => <div style={{ minHeight: 160, display: "grid", placeItems: "center", background: "var(--hjm-color-surface)", border: "var(--hjm-field-border-width) solid var(--hjm-color-border)", borderRadius: "var(--hjm-radius-lg)" }}><h3>{item.label}</h3></div>} /></section>
    <section><h2>목표 달성</h2><Button onClick={() => setEvent(value => value + 1)}>기록 달성 축하</Button>{event > 0 ? <><p role="status">{event}번째 기록을 남겼어요</p><Celebration eventId={`record-${event}`} /></> : null}</section>
  </div>;
}
const meta = { includeStories: ["Playground"], id: "experimental-interaction-adapters", title: "실험/구성/드래그·스와이프·모션", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Playground: StoryObj<typeof meta> = { name: "순서 이동·목록 작업·내용 전환",};
