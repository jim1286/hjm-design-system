import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { View, ScrollView, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { SortableCollection } from "@hjmds/react-native/sortable";
import { SwipeActions } from "@hjmds/react-native/swipe-actions";
import { ContentTransition, TextTransition } from "@hjmds/react-native/content-transition";
import { CarouselMotion } from "@hjmds/react-native/carousel-motion";
import { Celebration } from "@hjmds/react-native/celebration";
import { SharedTransitionElement, SharedTransitionScreen, createHjmTransitionStack, useSharedTransitionOptions } from "@hjmds/react-native/screen-transition";
import { Button } from "@hjmds/react-native/actions";
import { Text, Container, Section, Surface, Stack as LayoutStack } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import type { BlankStackScreenProps } from "react-native-screen-transitions/react-navigation";

import { Heading } from "@hjmds/react-native/heading";
import { ListRow } from "@hjmds/react-native/data-display";
import { StatusText } from "@hjmds/react-native/status-text";
import { interactionCopy as copy, interactionNoteStatus, interactionSeed as seed, interactionSortLabels as labels, type InteractionNoteStatus } from "../../shared/interaction-adapters-example";

type Routes = { Places: undefined; Detail: undefined };
const Stack = createHjmTransitionStack<Routes>();
const photo = { uri: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800" };
function Places({ navigation }: BlankStackScreenProps<Routes, "Places">) {
  return <SharedTransitionScreen style={{ padding: 16, gap: 16 }}><Heading level="level3">기억하고 싶은 장소</Heading>
    <SharedTransitionElement id="place-forest"><Image source={photo} accessibilityLabel="숲과 산" style={{ width: 160, height: 120, borderRadius: 16 }} /></SharedTransitionElement>
    <Button onPress={() => navigation.navigate("Detail")}>숲길 상세 보기</Button></SharedTransitionScreen>;
}
function Detail({ navigation }: BlankStackScreenProps<Routes, "Detail">) {
  return <SharedTransitionScreen style={{ padding: 16, gap: 16 }}><SharedTransitionElement id="place-forest"><Image source={photo} accessibilityLabel="숲과 산" style={{ width: "100%", height: 280, borderRadius: 16 }} /></SharedTransitionElement>
    <Heading level="level3">조용한 숲길</Heading><Text>사진이 원래 카드에서 상세 화면으로 이어집니다.</Text><Button onPress={() => navigation.goBack()}>목록으로 돌아가기</Button></SharedTransitionScreen>;
}
function SharedDemo() {
  const options = useSharedTransitionOptions("place-forest");
  return <NavigationIndependentTree><NavigationContainer><Stack.Navigator initialRouteName="Places" screenOptions={options}>
    <Stack.Screen name="Places" component={Places} /><Stack.Screen name="Detail" component={Detail} />
  </Stack.Navigator></NavigationContainer></NavigationIndependentTree>;
}
function Interactions() {
  const theme = useHjmNativeTheme();
  const [items, setItems] = useState<readonly (typeof seed)[number][]>(seed); const [openRow, setOpenRow] = useState<string | null>(null);
  const [note, setNote] = useState<InteractionNoteStatus>("idle"); const [step, setStep] = useState(0);
  const [slide, setSlide] = useState<string>("forest"); const [width, setWidth] = useState(280); const [event, setEvent] = useState(0);
  // The carousel needs a measured height; the first slide's natural Surface height replaces this seed after layout.
  const [slideHeight, setSlideHeight] = useState(160);
  const record = step % 2 ? "ready" : "start";
  return <GestureHandlerRootView style={{ flex: 1 }}><ScrollView contentContainerStyle={{ paddingVertical: theme.tokens.spacing.md }}><Container gutter="compact"><LayoutStack gap="xl">
    <Section title={copy.sections.order}>
      <SortableCollection items={items} label={copy.favorites} labels={labels} renderItem={item => <Text emphasis="medium">{item.label}</Text>}
        onCommit={intent => setItems(intent.orderedIds.map(id => seed.find(item => item.id === id)!))} />
      <Text>{copy.currentOrder(items.map(item => item.label))}</Text>
    </Section>
    <Section title={copy.sections.note}>
      <SwipeActions rowId="note" label={copy.noteRow} actionsLabel={copy.noteShowActions} openRowId={openRow} onOpenRowChange={setOpenRow}
        actions={[{ id: "archive", label: copy.archive }, { id: "delete", label: copy.remove, intent: "danger", disabled: true }]} onAction={() => setNote("archived")} onError={() => setNote("failed")}>
        <ListRow title={copy.noteRow} /></SwipeActions>
      <StatusText>{interactionNoteStatus[note]}</StatusText>
    </Section>
    <Section title={copy.sections.transition}>
      <Button tone="secondary" onPress={() => setStep(value => value + 1)}>{copy.nextState}</Button>
      <ContentTransition stateKey={record}><Heading level="level4">{copy.record[record]}</Heading></ContentTransition>
      <TextTransition text={copy.textTransition[record]} />
    </Section>
    <Section title={copy.sections.cards}>
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)}><CarouselMotion width={width} height={slideHeight} slides={seed} currentKey={slide} onCurrentKeyChange={setSlide}
        label={copy.places} previousLabel={copy.previousPlace} nextLabel={copy.nextPlace}
        renderSlide={item => <Surface padding="lg" onLayout={item.id === seed[0].id ? e => setSlideHeight(Math.max(1, Math.ceil(e.nativeEvent.layout.height))) : undefined}>
          <LayoutStack align="center"><Heading level="level4">{item.label}</Heading></LayoutStack></Surface>} /></View>
    </Section>
    <Section title={copy.sections.goal}>
      <Button tone="secondary" onPress={() => setEvent(value => value + 1)}>{copy.celebrate}</Button>
      {event > 0 ? <StatusText announceOnMount>{copy.celebrated(event)}</StatusText> : null}
    </Section>
  </LayoutStack></Container></ScrollView>
    {/* A viewport overlay stays visible after scrolling; a content child starts offscreen. */}
    {event > 0 ? <Celebration eventId={`record-${event}`} /> : null}</GestureHandlerRootView>;
}
// Both stories render the composition directly in the canvas; the former Modal launcher hid it behind a primary button
// and closed with a body text button (2026-10-17 composition review).
function Demo({ shared = false }: { shared?: boolean }) {
  return shared ? <GestureHandlerRootView style={{ flex: 1 }}><SharedDemo /></GestureHandlerRootView> : <Interactions />;
}
const meta = { title: "배포/구성/직접 조작과 모션/끌기·밀기·화면 전환", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const SharedScreenTransition: StoryObj<typeof meta> = { name: "카드 확대와 화면 전환", args: { shared: true } };
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };

// Explicit scenarios make accessibility preferences reproducible without changing the device. They set the shared
// `motion` global instead of wrapping a provider in render: a nested provider hid the toolbar state and also forced
// dark·RTL·200% into one story, so it no longer showed reduced motion alone (2026-10-06 Storybook spec).
export const ReducedMotion: StoryObj<typeof meta> = { name: "동작 줄이기", globals: { motion: "reduced" } };
export const SharedScreenTransitionReducedMotion: StoryObj<typeof meta> = { ...SharedScreenTransition, name: "카드 확대와 화면 전환 · 동작 줄이기", globals: { motion: "reduced" } };
