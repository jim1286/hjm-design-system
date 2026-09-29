import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { View, Modal, ScrollView, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { SortableCollection } from "@hjmds/react-native/sortable";
import { SwipeActions } from "@hjmds/react-native/swipe-actions";
import { ContentTransition, TextTransition } from "@hjmds/react-native/content-transition";
import { CarouselMotion } from "@hjmds/react-native/carousel-motion";
import { Celebration } from "@hjmds/react-native/celebration";
import { SharedTransitionElement, SharedTransitionScreen, createHjmTransitionStack, useSharedTransitionOptions } from "@hjmds/react-native/screen-transition";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";
import type { SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";
import type { BlankStackScreenProps } from "react-native-screen-transitions/react-navigation";

const seed = [{ id: "forest", label: "숲길" }, { id: "sea", label: "바닷가" }, { id: "cafe", label: "작은 카페" }];
const labels = {
  instructions: "스페이스로 잡고 화살표로 이동, 스페이스로 놓거나 Escape로 취소합니다.",
  dragStart: (item: SortableItem) => `${item.label} 이동 시작`, dragCancel: "이동을 취소했어요",
  handle: (item: SortableItem) => `${item.label} 순서 이동`, previous: (item: SortableItem) => `${item.label} 앞으로`,
  next: (item: SortableItem) => `${item.label} 뒤로`, position: (item: SortableItem, position: number, total: number) => `${item.label}, ${total}개 중 ${position}번째`,
};
type Routes = { Places: undefined; Detail: undefined };
const Stack = createHjmTransitionStack<Routes>();
const photo = { uri: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800" };
function Places({ navigation }: BlankStackScreenProps<Routes, "Places">) {
  return <SharedTransitionScreen style={{ padding: 16, gap: 16 }}><Text variant="title">기억하고 싶은 장소</Text>
    <SharedTransitionElement id="place-forest"><Image source={photo} accessibilityLabel="숲과 산" style={{ width: 160, height: 120, borderRadius: 16 }} /></SharedTransitionElement>
    <Button onPress={() => navigation.navigate("Detail")}>숲길 상세 보기</Button></SharedTransitionScreen>;
}
function Detail({ navigation }: BlankStackScreenProps<Routes, "Detail">) {
  return <SharedTransitionScreen style={{ padding: 16, gap: 16 }}><SharedTransitionElement id="place-forest"><Image source={photo} accessibilityLabel="숲과 산" style={{ width: "100%", height: 280, borderRadius: 16 }} /></SharedTransitionElement>
    <Text variant="title">조용한 숲길</Text><Text>사진이 원래 카드에서 상세 화면으로 이어집니다.</Text><Button onPress={() => navigation.goBack()}>목록으로 돌아가기</Button></SharedTransitionScreen>;
}
function SharedDemo() {
  const options = useSharedTransitionOptions("place-forest");
  return <NavigationIndependentTree><NavigationContainer><Stack.Navigator initialRouteName="Places" screenOptions={options}>
    <Stack.Screen name="Places" component={Places} /><Stack.Screen name="Detail" component={Detail} />
  </Stack.Navigator></NavigationContainer></NavigationIndependentTree>;
}
function Interactions() {
  const theme = useHjmNativeTheme();
  const [items, setItems] = useState(seed); const [openRow, setOpenRow] = useState<string | null>(null);
  const [action, setAction] = useState("선택 없음"); const [step, setStep] = useState(0);
  const [slide, setSlide] = useState("forest"); const [width, setWidth] = useState(280); const [event, setEvent] = useState(0);
  return <View style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: theme.tokens.spacing.md, gap: theme.tokens.spacing.lg }}>
    <Text variant="title">즐겨찾기 순서</Text><SortableCollection items={items} label="즐겨찾기" labels={labels} renderItem={() => null}
      onCommit={intent => setItems(intent.orderedIds.map(id => seed.find(item => item.id === id)!))} />
    <Text>현재 순서: {items.map(item => item.label).join(" → ")}</Text>
    <Text variant="title">목록 작업</Text><SwipeActions rowId="note" label="내 기록" actionsLabel="기록 작업 보기" openRowId={openRow} onOpenRowChange={setOpenRow}
      actions={[{ id: "archive", label: "보관" }, { id: "delete", label: "삭제", intent: "danger", disabled: true }]} onAction={() => setAction("보관했어요")} onError={() => setAction("다시 시도해 주세요")}>
      <View style={{ padding: theme.tokens.spacing.lg }}><Text>오늘 걸었던 숲길</Text></View></SwipeActions><Text>{action}</Text>
    <Text variant="title">내용 전환</Text><Button onPress={() => setStep(value => value + 1)}>다음 상태</Button><ContentTransition stateKey={String(step)}><Text>{step % 2 ? "기록이 준비됐어요" : "새로운 기록을 시작해요"}</Text></ContentTransition>
    <TextTransition text={step % 2 ? "저장 완료 👨‍👩‍👧‍👦" : "나만의 하루 🌿"} />
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)}><CarouselMotion width={width} height={160} slides={seed} currentKey={slide} onCurrentKeyChange={setSlide}
      label="추천 장소" previousLabel="이전 장소" nextLabel="다음 장소" renderSlide={item => <View style={{ height: 160, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.surface }}><Text variant="title">{item.label}</Text></View>} /></View>
    <Button onPress={() => setEvent(value => value + 1)}>기록 달성 축하</Button>{event > 0 ? <Text>{event}번째 기록을 남겼어요</Text> : null}
  </ScrollView>
    {/* A viewport overlay stays visible after scrolling; a content child starts offscreen. */}
    {event > 0 ? <Celebration eventId={`record-${event}`} /> : null}</View>;
}
function Demo({ shared = false }: { shared?: boolean }) {
  const [open, setOpen] = useState(false); const insets = useSafeAreaInsets(); const theme = useHjmNativeTheme();
  return <><Button onPress={() => setOpen(true)}>{shared ? "화면 전환 열기" : "상호작용 열기"}</Button><Modal visible={open} onRequestClose={() => setOpen(false)} animationType="none">
    <GestureHandlerRootView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.colors.bg }}>
      <Button tone="secondary" onPress={() => setOpen(false)}>쇼케이스로 돌아가기</Button>{open ? shared ? <SharedDemo /> : <Interactions /> : null}
    </GestureHandlerRootView></Modal></>;
}
const meta = { title: "Experimental/Interaction Adapters", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const SharedScreenTransition: StoryObj<typeof meta> = { args: { shared: true } };

// Explicit scenarios make accessibility preferences reproducible without changing the device.
export const ReducedMotion: StoryObj<typeof meta> = { render: () => <HjmNativeProvider theme="dark" direction="rtl" textScale={2} reducedMotion><Demo /></HjmNativeProvider> };
export const SharedReducedMotion: StoryObj<typeof meta> = { render: () => <HjmNativeProvider theme="dark" reducedMotion><Demo shared /></HjmNativeProvider> };
