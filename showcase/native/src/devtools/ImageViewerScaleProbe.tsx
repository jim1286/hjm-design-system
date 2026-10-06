import { resolveImageInspectionGeometry } from "@hjmds/design-contracts/components/image";
import { useEffect, useRef, useState } from "react";
import { Image, Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery, ResumableZoom, type GalleryRefType, type ResumableZoomRefType } from "react-native-zoom-toolkit";
import { Button, Stack, Surface, Text, useHjmNativeTheme } from "@hjmds/react-native";

// Engine probe, not a public component/story: compare exact-size pan without
// depending on Gallery's private scale values or changing its default gestures.
export function ImageViewerScaleProbe() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState<"gallery" | "resumable">("gallery");
  const [mode, setMode] = useState<"fit" | "double" | "pixels">("double");
  const [viewport, setViewport] = useState({ width: 1, height: 1 });
  const [measurement, setMeasurement] = useState("측정 전");
  const gallery = useRef<GalleryRefType>(null);
  const zoom = useRef<ResumableZoomRefType>(null);
  const { colors } = useHjmNativeTheme();
  const source = Image.resolveAssetSource(require("../../../shared/photos/valley.jpg"));
  const { width, height } = resolveImageInspectionGeometry(source, viewport, mode);
  const key = `${engine}:${mode}:${viewport.width}:${viewport.height}`;
  useEffect(() => setMeasurement("측정 전"), [key]);
  const photo = <Image source={source} accessibilityLabel="600×600 계곡 진단 사진" style={{ width, height }} resizeMode="contain" />;
  function measure() {
    const state = (engine === "gallery" ? gallery.current : zoom.current)?.getState();
    if (state) setMeasurement(`이동 ${state.translateX.toFixed(1)}, ${state.translateY.toFixed(1)} · 엔진 배율 ${state.scale.toFixed(2)}`);
  }
  return <><Button onPress={() => setOpen(true)}>정확한 배율 진단</Button>
    <Modal visible={open} presentationStyle="fullScreen" onRequestClose={() => setOpen(false)}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <Surface padding="md"><Stack gap="xs">
            <Button onPress={() => setOpen(false)}>진단 닫기</Button>
            <Stack axis="inline" wrap>
              <Button onPress={() => setEngine("gallery")}>Gallery</Button>
              <Button onPress={() => setEngine("resumable")}>Resumable</Button>
              <Button onPress={() => setMode("fit")}>맞춤</Button>
              <Button onPress={() => setMode("double")}>2배</Button>
              <Button onPress={() => setMode("pixels")}>출력 크기</Button>
            </Stack>
            <Text>{engine} · {mode} · {width.toFixed(0)}×{height.toFixed(0)} / {viewport.width.toFixed(0)}×{viewport.height.toFixed(0)}</Text>
          </Stack></Surface>
          <View style={{ flex: 1, overflow: "hidden" }} onLayout={event => setViewport(event.nativeEvent.layout)}>
            {engine === "gallery" ? <Gallery ref={gallery} key={key} data={["photo"]} zoomEnabled={false} tapOnEdgeToItem={false} renderItem={() => photo} />
              : <ResumableZoom ref={zoom} key={key} style={{ flex: 1 }} minScale={1} maxScale={1} pinchEnabled={false} tapsEnabled={false} panMode="clamp">{photo}</ResumableZoom>}
          </View>
          <Surface padding="md"><Stack gap="xs">
            <Button onPress={measure}>위치 측정</Button>
            <Text>{measurement}</Text>
          </Stack></Surface>
        </View>
      </GestureHandlerRootView>
    </Modal>
  </>;
}
