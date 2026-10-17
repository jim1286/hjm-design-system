import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SortableCollection } from "@hjmds/react/sortable";
import { SwipeActions } from "@hjmds/react/swipe-actions";
import { ContentTransition, TextTransition } from "@hjmds/react/content-transition";
import { CarouselMotion } from "@hjmds/react/carousel-motion";
import { Celebration } from "@hjmds/react/celebration";
import { Button } from "@hjmds/react/actions";
import { Container, Section, Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { ListRow } from "@hjmds/react/display";
import { StatusText } from "@hjmds/react/status-text";
import { interactionCopy as copy, interactionNoteStatus, interactionSeed as seed, interactionSortLabels as labels, type InteractionNoteStatus } from "../../../shared/interaction-adapters-example.js";

function Demo() {
  const [items, setItems] = useState<readonly (typeof seed)[number][]>(seed);
  const [note, setNote] = useState<InteractionNoteStatus>("idle");
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState<string>("forest");
  const [event, setEvent] = useState(0);
  const record = step % 2 ? "ready" : "start";
  return <Container size="reading"><Stack gap="xl">
    <Section title={copy.sections.order}>
      <SortableCollection items={items} label={copy.favorites} labels={labels} renderItem={item => <Text emphasis="medium">{item.label}</Text>}
        onCommit={intent => setItems(intent.orderedIds.map(id => seed.find(item => item.id === id)!))} />
      <Text>{copy.currentOrder(items.map(item => item.label))}</Text>
    </Section>
    <Section title={copy.sections.note}>
      <SwipeActions label={copy.noteActions} actions={[{ id: "archive", label: copy.archive }, { id: "delete", label: copy.remove, intent: "danger", disabled: true }]}
        onAction={() => setNote("archived")} onError={() => setNote("failed")}><ListRow title={copy.noteRow} /></SwipeActions>
      <StatusText>{interactionNoteStatus[note]}</StatusText>
    </Section>
    <Section title={copy.sections.transition}>
      <Button tone="secondary" onClick={() => setStep(value => value + 1)}>{copy.nextState}</Button>
      <ContentTransition stateKey={record}><Heading level="level4">{copy.record[record]}</Heading></ContentTransition>
      <TextTransition text={copy.textTransition[record]} />
    </Section>
    <Section title={copy.sections.cards}>
      <CarouselMotion slides={seed} currentKey={slide} onCurrentKeyChange={setSlide} label={copy.places} previousLabel={copy.previousPlace} nextLabel={copy.nextPlace}
        renderSlide={item => <Surface padding="lg"><Stack align="center"><Heading level="level4">{item.label}</Heading></Stack></Surface>} />
    </Section>
    <Section title={copy.sections.goal}>
      <Button tone="secondary" onClick={() => setEvent(value => value + 1)}>{copy.celebrate}</Button>
      {event > 0 ? <><StatusText>{copy.celebrated(event)}</StatusText><Celebration eventId={`record-${event}`} /></> : null}
    </Section>
  </Stack></Container>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "experimental-interaction-adapters", title: "배포/구성/직접 조작과 모션/끌기·밀기·화면 전환", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
