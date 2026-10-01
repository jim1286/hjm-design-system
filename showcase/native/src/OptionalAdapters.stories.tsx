import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { View, Pressable, TextInput, Modal, Keyboard } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import { ImageViewer } from "@hjmds/react-native/image-viewer";
import { KeyboardMotionProvider, KeyboardDock, KeyboardFormScrollView } from "@hjmds/react-native/keyboard-controller";
import { GestureSheet, GestureSheetProvider, GestureSheetInput, dismissTopGestureSheet } from "@hjmds/react-native/sheet-gesture";
import { NativeContextMenu } from "@hjmds/react-native/context-menu-native";
import { spacing } from "@hjmds/design-contracts/tokens";
function Adapters({ onClose }: { onClose: () => void }) {
  const [viewer, setViewer] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [action, setAction] = useState("선택 없음");
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return <GestureHandlerRootView style={{ flex: 1 }}><KeyboardMotionProvider><GestureSheetProvider>
    <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.md }}><Button tone="secondary" onPress={onClose}>쇼케이스로 돌아가기</Button></View>
    <KeyboardFormScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}>
      <Text>실험 단계 · 네이티브 모듈을 포함한 개발 클라이언트 필요</Text>
      <Button onPress={() => setViewer(true)}>이미지 보기</Button>
      <Button onPress={() => setSheet(true)}>시트 열기</Button>
      <NativeContextMenu items={[{ id: "save", label: "저장" }, { id: "delete", label: "삭제", tone: "danger" }]} onAction={setAction}>
        <Pressable accessibilityLabel="길게 눌러 작업 선택" accessibilityRole="button"><Text>길게 눌러 메뉴 열기</Text></Pressable>
      </NativeContextMenu>
      <Text>{action}</Text><Text>시트 상태: {sheet ? "열림" : "닫힘"}</Text><TextInput accessibilityLabel="메모" placeholder="키보드 동작 확인" />
    </KeyboardFormScrollView>
    <KeyboardDock><View style={{ paddingHorizontal: spacing.md, paddingBottom: keyboardOpen ? 0 : insets.bottom }}><Button onPress={() => Keyboard.dismiss()}>완료</Button></View></KeyboardDock>
    <GestureSheet open={sheet} onOpenChange={setSheet} title="상세 보기" closeLabel="닫기">
      <GestureSheetInput accessibilityLabel="시트 메모" placeholder="메모 입력" /><Text>드래그해서 높이를 바꿀 수 있습니다.</Text>
    </GestureSheet>
    <ImageViewer safeAreaInsets={insets} open={viewer} onClose={() => setViewer(false)} items={[{ id: "one", uri: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200", label: "숲속 사슴" }]}
      closeLabel="닫기" previousLabel="이전" nextLabel="다음" loadingLabel="불러오는 중" errorLabel="이미지를 불러오지 못했습니다" retryLabel="다시 시도" />
  </GestureSheetProvider></KeyboardMotionProvider></GestureHandlerRootView>;
}
// Sticky keyboard coordinates are window-relative. The Storybook canvas leaves a
// toolbar below it, so adapters need an app-sized host rather than a canvas offset.
function Demo() {
  const [open, setOpen] = useState(false);
  return <><Button onPress={() => setOpen(true)}>전체 화면 어댑터 열기</Button>
    <Modal visible={open} animationType="none" statusBarTranslucent navigationBarTranslucent
      // Android back inside a Modal never reaches BackHandler; let an open sheet close first.
      onRequestClose={() => { if (!dismissTopGestureSheet()) setOpen(false); }}>
      <Adapters onClose={() => setOpen(false)} />
    </Modal></>;
}
const meta = { title: "실험/구성/이미지·시트·키보드 조작", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Playground: StoryObj<typeof meta> = { name: "직접 조작",};
