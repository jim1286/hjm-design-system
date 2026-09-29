import { useState, type ReactNode } from "react";
import { Image, Modal, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ImageViewerItem = { id: string; uri: string; label: string };
export type ImageViewerProps = {
  open: boolean;
  items: readonly ImageViewerItem[];
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  safeAreaInsets: { top: number; bottom: number };
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
};

function ViewerImage({ item, width, height, loadingLabel, errorLabel, retryLabel }: {
  item: ImageViewerItem; width: number; height: number;
  loadingLabel: string; errorLabel: string; retryLabel: string;
}) {
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  let feedback: ReactNode = null;
  if (status === "loading") feedback = <Text accessibilityLiveRegion="polite">{loadingLabel}</Text>;
  if (status === "error") feedback = <View><Text>{errorLabel}</Text><Button onPress={() => { setStatus("loading"); setAttempt(value => value + 1); }}>{retryLabel}</Button></View>;
  return <View style={{ width, height, justifyContent: "center" }}>
    <Image key={`${item.uri}:${attempt}`} source={{ uri: item.uri }} accessibilityLabel={item.label}
      resizeMode="contain" style={{ width, height }} onLoad={() => setStatus("ready")} onError={() => setStatus("error")} />
    {feedback ? <View style={{ position: "absolute", alignSelf: "center" }}>{feedback}</View> : null}
  </View>;
}

/** Unmount the session on close so every open starts at the requested image. */
export function ImageViewer(props: ImageViewerProps) {
  if (!props.open) return null;
  if (!props.items.length || new Set(props.items.map(item => item.id)).size !== props.items.length ||
    props.items.some(item => !item.id.trim() || !item.uri.trim() || !item.label.trim()) ||
    [props.closeLabel, props.previousLabel, props.nextLabel, props.loadingLabel, props.errorLabel, props.retryLabel].some(label => !label.trim()) ||
    !Number.isInteger(props.initialIndex ?? 0) || (props.initialIndex ?? 0) < 0 || (props.initialIndex ?? 0) >= props.items.length) {
    throw new TypeError("ImageViewer needs named images, localized controls and a valid index");
  }
  // A replaced collection starts a fresh session; stale indexes must not reach the gesture engine.
  return <ImageViewerSession key={props.items.map(item => `${item.id}:${item.uri}`).join("|")} {...props} />;
}

function ImageViewerSession(props: ImageViewerProps) {
  const theme = useHjmNativeTheme();
  const { width, height } = useWindowDimensions();
  // Measure remaining space after controls and safe areas; a screen-height ratio clips large text.
  const [viewport, setViewport] = useState({ width, height: height * 0.6 });
  const [index, setIndex] = useState(props.initialIndex ?? 0);
  const [galleryKey, setGalleryKey] = useState(0);
  const currentIndex = Math.min(index, props.items.length - 1);
  const change = (next: number) => { setIndex(next); props.onIndexChange?.(next); };
  // Accessible buttons remount at the selected index; paging must not require a swipe.
  // Gallery uses a short paging transition; reduced motion removes it entirely.
  const navigate = (next: number) => { change(next); setGalleryKey(value => value + 1); };
  return <Modal visible animationType={theme.environment.reducedMotion ? "none" : "fade"} onRequestClose={props.onClose}>
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View accessibilityViewIsModal style={{ flex: 1, paddingTop: props.safeAreaInsets.top, paddingBottom: props.safeAreaInsets.bottom }}>
        <Button onPress={props.onClose}>{props.closeLabel}</Button>
        <View style={{ flex: 1 }} onLayout={event => { const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout; if (measuredWidth > 0 && measuredHeight > 0) setViewport({ width: measuredWidth, height: measuredHeight }); }}>
          <Gallery key={galleryKey} data={[...props.items]} initialIndex={currentIndex} keyExtractor={item => item.id}
            rtl={theme.environment.direction === "rtl"} onIndexChange={change}
            snapTimingConfig={{ duration: theme.environment.reducedMotion ? 0 : 250 }}
            renderItem={item => <ViewerImage key={item.uri} item={item} width={viewport.width} height={viewport.height}
              loadingLabel={props.loadingLabel} errorLabel={props.errorLabel} retryLabel={props.retryLabel} />} />
        </View>
        <Text accessibilityLiveRegion="polite">{props.items[currentIndex]?.label}</Text>
        <Button disabled={currentIndex === 0} onPress={() => navigate(currentIndex - 1)}>{props.previousLabel}</Button>
        <Button disabled={currentIndex >= props.items.length - 1} onPress={() => navigate(currentIndex + 1)}>{props.nextLabel}</Button>
      </View>
    </GestureHandlerRootView>
  </Modal>;
}
