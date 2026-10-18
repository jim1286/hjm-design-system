// 1.31 Dialog companions: the decorative layer outside the card (BurnTok folder drag ghost) and the edge-to-edge
// presentation (utilverse display board). Shared preview module; stories import it, never each other.
import { useState } from "react";
import { View, type GestureResponderEvent } from "react-native";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { Stack, Text, useHjmNativeTheme } from "@hjmds/react-native";
import { Dialog, ImmersiveOverlay } from "@hjmds/react-native/overlays";

const apps = ["메모", "날씨", "계산기"] as const;
type Drag = Readonly<{ label: string; x: number; y: number }>;
const ghostSize = 56;

export function DialogOverlayLayerPreview() {
  const { colors, tokens } = useHjmNativeTheme();
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const at = (label: string, event: GestureResponderEvent) => setDrag({ label, x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
  return <Stack>
    <Text>폴더 안 항목을 끌면 카드 밖까지 따라오는 미리보기가 그려져요.</Text>
    <Button onPress={() => setOpen(true)}>폴더 열기</Button>
    <Dialog open={open} onOpenChange={next => { setDrag(null); setOpen(next); }} title="즐겨 쓰는 앱" closeLabel="폴더 닫기"
      // The body stops scrolling while a tile is dragged, so the responder keeps the touch (scrollEnabled, 1.31).
      scrollEnabled={drag === null}
      // Window coordinates (pageX/pageY); the layer never takes touches, so the tiles keep the responder.
      overlayLayer={drag ? <View style={{ position: "absolute", left: drag.x - ghostSize / 2, top: drag.y - ghostSize / 2, width: ghostSize, height: ghostSize,
        alignItems: "center", justifyContent: "center", borderRadius: tokens.radius.md, backgroundColor: colors.surfaceAccent }}><Text>{drag.label}</Text></View> : null}>
      <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
        {apps.map(label => <View key={label} style={{ flex: 1 }}
          onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
          onResponderGrant={event => at(label, event)} onResponderMove={event => at(label, event)}
          onResponderRelease={() => setDrag(null)} onResponderTerminate={() => setDrag(null)}>
          <Button tone="secondary" onPress={() => undefined}>{label}</Button>
        </View>)}
      </View>
    </Dialog>
  </Stack>;
}

export function ImmersiveOverlayPreview() {
  const { colors } = useHjmNativeTheme();
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  return <Stack>
    <Text>전광판처럼 화면 전체를 채워 보여 주고, 닫기와 뒤로 가기로 돌아와요.</Text>
    <Button onPress={() => setOpen(true)}>전광판 보기</Button>
    <ImmersiveOverlay open={open} onOpenChange={setOpen} label="전광판" exitLabel="전광판 닫기"
      status={<Text tone="muted">{paused ? "멈춤" : "흐르는 중"}</Text>}
      tools={<IconButton label={paused ? "다시 흐르기" : "멈추기"} tone="secondary" size="large" onPress={() => setPaused(!paused)}><Text>{paused ? "▶" : "Ⅱ"}</Text></IconButton>}>
      {/* The stage is product output: theme colours, centered so cutouts in landscape never cover it. */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.text }}>
        <Text variant="title" color={colors.bg}>환영해요</Text>
      </View>
    </ImmersiveOverlay>
  </Stack>;
}
