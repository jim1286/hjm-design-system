import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Image, Modal, Platform, View, useWindowDimensions, type ModalProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { containerDefaults, containerRecipe } from "@hjmds/design-contracts/components/container";
import { Button } from "./actions.js";
import { SegmentedControl } from "./inputs.js";
import { ImageInspection, type ImageViewerInspection } from "./internal/image-inspection.js";
export type { ImageViewerInspection } from "./internal/image-inspection.js";
import { Surface, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ImageViewerItem = { id: string; uri: string; label: string; width?: number; height?: number };
export type ImageViewerImageStatus = "loading" | "ready" | "error";
export type ImageViewerImageRenderProps = Readonly<{
  item: ImageViewerItem;
  width: number;
  height: number;
  /** Product host readiness: Expo hosts can use onDisplay instead of onLoad. */
  onReady: () => void;
  onError: () => void;
}>;
export type ImageViewerImageStatusEvent = Readonly<{
  item: ImageViewerItem;
  status: ImageViewerImageStatus;
}>;
export type ImageViewerProps = {
  open: boolean;
  items: readonly ImageViewerItem[];
  initialIndex?: number;
  /** Exact-size review requires positive intrinsic width/height on every item. */
  inspection?: ImageViewerInspection;
  /** The frame, feedback and retry remain HJM-owned; caching/display belong to the host. */
  renderImage?: (props: ImageViewerImageRenderProps) => ReactNode;
  /** Per mounted image, including offscreen pages. Not an export approval or visibility proof. */
  onImageStatusChange?: (event: ImageViewerImageStatusEvent) => void;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  safeAreaInsets: { top: number; bottom: number; left?: number; right?: number };
  /** Allowed orientations still depend on the product manifest and OS rotation lock. */
  supportedOrientations?: ModalProps["supportedOrientations"];
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
};

type ViewerImageProps = {
  item: ImageViewerItem; width: number; height: number;
  renderImage?: ImageViewerProps["renderImage"];
  onImageStatusChange?: ImageViewerProps["onImageStatusChange"];
};

function ViewerImage({ item, width, height, renderImage, onImageStatusChange }: ViewerImageProps) {
  const [status, setStatus] = useState<ImageViewerImageStatus>("loading");
  const currentStatus = useRef<ImageViewerImageStatus>("loading");
  const alive = useRef(false);
  const notify = useRef(onImageStatusChange);
  useLayoutEffect(() => { notify.current = onImageStatusChange; });
  useLayoutEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => { notify.current?.({ item, status }); }, [item.id, item.uri, status]);
  const report = (next: "ready" | "error") => {
    // Failure is terminal until explicit retry. Some native hosts can emit both
    // load/display and error callbacks for an old request; the last one must not win.
    if (!alive.current || currentStatus.current === "error" || currentStatus.current === next) return;
    currentStatus.current = next;
    setStatus(next);
  };
  const onReady = () => report("ready");
  const onError = () => report("error");
  return <View style={{ width, height, justifyContent: "center" }}>
    {renderImage ? renderImage({ item, width, height, onReady, onError }) :
      <Image source={{ uri: item.uri }} accessibilityLabel={item.label}
        resizeMode="contain" style={{ width, height }} onLoad={onReady} onError={onError} />}
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
  if (props.inspection) {
    if (!["fit", "double", "pixels"].includes(props.inspection.mode) ||
      Object.values(props.inspection.labels).some(label => !label.trim()) ||
      props.items.some(item => !Number.isFinite(item.width) || !Number.isFinite(item.height) || (item.width ?? 0) <= 0 || (item.height ?? 0) <= 0)) {
      throw new TypeError("Image inspection requires a valid mode, labels and intrinsic image sizes");
    }
  }
  // Structured identity avoids delimiter collisions in product IDs/URIs. A replaced
  // collection must retire image callbacks as well as reset the gesture engine.
  return <ImageViewerSession key={JSON.stringify(props.items.map(item => [item.id, item.uri, item.width, item.height]))} {...props} />;
}

function ImageViewerSession(props: ImageViewerProps) {
  const theme = useHjmNativeTheme();
  const gutter = containerRecipe.gutters[containerDefaults.gutter];
  // Landscape cutouts are physical edges, independent of text direction. Keep
  // controls inside them while the photograph can use the full gallery width.
  const controlInsets = {
    paddingLeft: gutter + (props.safeAreaInsets.left ?? 0),
    paddingRight: gutter + (props.safeAreaInsets.right ?? 0),
  };
  const { width, height } = useWindowDimensions();
  // Measure remaining space after controls and safe areas; a screen-height ratio clips large text.
  const [viewport, setViewport] = useState({ width, height: height * 0.6 });
  const [index, setIndex] = useState(props.initialIndex ?? 0);
  const [galleryKey, setGalleryKey] = useState(0);
  const [statuses, setStatuses] = useState<ReadonlyMap<string, ImageViewerImageStatus>>(new Map());
  const currentIndex = Math.min(index, props.items.length - 1);
  const change = (next: number) => { setIndex(next); props.onIndexChange?.(next); };
  // Accessible buttons remount at the selected index; paging must not require a swipe.
  // Gallery uses a short paging transition; reduced motion removes it entirely.
  const resetImages = () => { setStatuses(new Map()); setGalleryKey(value => value + 1); };
  const navigate = (next: number) => { change(next); resetImages(); };
  const currentStatus = statuses.get(props.items[currentIndex]!.id) ?? "loading";
  useEffect(() => {
    if (currentStatus === "error" && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(props.errorLabel);
  }, [currentStatus, currentIndex, props.errorLabel]);
  const reportImageStatus = (event: ImageViewerImageStatusEvent) => {
    setStatuses(previous => new Map(previous).set(event.item.id, event.status));
    props.onImageStatusChange?.(event);
  };
  return <Modal visible presentationStyle="fullScreen" supportedOrientations={props.supportedOrientations}
    animationType={theme.environment.reducedMotion ? "none" : "fade"} onRequestClose={props.onClose}>
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View accessibilityViewIsModal style={{ flex: 1, paddingTop: props.safeAreaInsets.top, paddingBottom: props.safeAreaInsets.bottom }}>
        {/* Controls and caption share the page gutter (Container's default); they
            ran edge to edge and the caption touched the screen edge (2026-09-30
            audit). The image area stays full-bleed so zoom keeps the whole width. */}
        <View style={controlInsets}><Button growWithContent onPress={props.onClose}>{props.closeLabel}</Button></View>
        {props.inspection ? <View style={controlInsets}><SegmentedControl label={props.inspection.labels.mode}
          value={props.inspection.mode} onValueChange={props.inspection.onModeChange}
          items={[{ value: "fit", label: props.inspection.labels.fit }, { value: "double", label: props.inspection.labels.double }, { value: "pixels", label: props.inspection.labels.pixels }]} /></View> : null}
        {props.inspection ? <ImageInspection key={`${currentIndex}:${props.inspection.mode}`} config={props.inspection}
          imageSize={{ width: props.items[currentIndex]!.width!, height: props.items[currentIndex]!.height! }} controlsInset={controlInsets}
          feedbackLabels={{ loading: props.loadingLabel, error: props.errorLabel, retry: props.retryLabel }}
          renderImage={(width, height, report) => <ViewerImage item={props.items[currentIndex]!} width={width} height={height}
            renderImage={props.renderImage} onImageStatusChange={event => { report(event.status); reportImageStatus(event); }} />} /> : <View style={{ flex: 1 }} onLayout={event => { const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout; if (measuredWidth > 0 && measuredHeight > 0) setViewport({ width: measuredWidth, height: measuredHeight }); }}>
          <Gallery key={galleryKey} data={[...props.items]} initialIndex={currentIndex} keyExtractor={item => item.id}
            rtl={theme.environment.direction === "rtl"} onIndexChange={change}
            snapTimingConfig={{ duration: theme.environment.reducedMotion ? 0 : 250 }}
            renderItem={item => <ViewerImage key={item.uri} item={item} width={viewport.width} height={viewport.height}
              renderImage={props.renderImage} onImageStatusChange={reportImageStatus} />} />
          {/* Zoom Toolkit places a gesture layer above its rendered images. Keep feedback
              beside Gallery, not inside renderItem, so retry receives actual native touches.
              An opaque semantic surface keeps the copy legible over decoded photo pixels. */}
          {currentStatus !== "ready" ? <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", ...controlInsets }}>
            <Surface padding="md">
              {currentStatus === "error" ? <View><Text accessibilityLiveRegion="assertive">{props.errorLabel}</Text><Button growWithContent onPress={resetImages}>{props.retryLabel}</Button></View>
                : <Text accessibilityLiveRegion="polite">{props.loadingLabel}</Text>}
            </Surface>
          </View> : null}
        </View>}
        <View style={{ gap: theme.tokens.spacing.xs, ...controlInsets, paddingTop: theme.tokens.spacing.sm }}>
          <Text accessibilityLiveRegion="polite">{props.items[currentIndex]?.label}</Text>
          {(!props.inspection || props.items.length > 1) ? <><Button growWithContent disabled={currentIndex === 0} onPress={() => navigate(currentIndex - 1)}>{props.previousLabel}</Button>
          <Button growWithContent disabled={currentIndex >= props.items.length - 1} onPress={() => navigate(currentIndex + 1)}>{props.nextLabel}</Button></> : null}
        </View>
      </View>
    </GestureHandlerRootView>
  </Modal>;
}
