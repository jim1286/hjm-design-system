import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { ResumableZoom, type ResumableZoomRefType } from "react-native-zoom-toolkit";
import { resolveImageInspectionGeometry, type ImageInspectionMode } from "@hjmds/design-contracts/components/image";
import { Button } from "../actions.js";
import { Surface, Text } from "../primitives.js";

export type ImageViewerInspection = Readonly<{
  mode: ImageInspectionMode;
  onModeChange: (mode: ImageInspectionMode) => void;
  labels: Readonly<{
    mode: string; fit: string; double: string; pixels: string;
    left: string; right: string; up: string; down: string; center: string;
  }>;
  /** Image-relative viewport offset and limits, in layout units; products localize the result. */
  getPositionText: (position: Readonly<{ x: number; y: number; maxX: number; maxY: number }>) => string;
}>;

/** Internal exact-size viewport; the parent owns lifetime, modes, feedback and image readiness. */
export function ImageInspection({ imageSize, config, controlsInset, feedbackLabels, renderImage }: {
  imageSize: { width: number; height: number };
  config: ImageViewerInspection;
  controlsInset: { paddingLeft: number; paddingRight: number };
  feedbackLabels: { loading: string; error: string; retry: string };
  renderImage: (width: number, height: number, report: (status: "loading" | "ready" | "error") => void) => ReactNode;
}) {
  const ref = useRef<ResumableZoomRefType>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [attempt, setAttempt] = useState(0);
  const geometry = viewport.width > 0 && viewport.height > 0
    ? resolveImageInspectionGeometry(imageSize, viewport, config.mode) : null;
  const key = JSON.stringify([viewport.width, viewport.height, config.mode, attempt]);
  const identity = useMemo(() => ({}), [key]);
  const active = useRef<object | null>(null);
  useLayoutEffect(() => {
    active.current = identity;
    return () => { active.current = null; };
  }, [identity]);
  const [reported, setReported] = useState<{ identity: object; status: "loading" | "ready" | "error" } | null>(null);
  const [position, setPosition] = useState({ identity, x: 0, y: 0 });
  const status = reported?.identity === identity ? reported.status : "loading";
  const ready = status === "ready";
  function commitPosition(x: number, y: number) {
    if (active.current !== identity) return;
    setPosition({ identity, x, y });
    // iOS does not read React Native live regions; announce only completed user
    // movements, never every animation frame or initial layout measurement.
    if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(config.getPositionText({
      x, y, maxX: geometry?.panBounds.x ?? 0, maxY: geometry?.panBounds.y ?? 0,
    }));
  }
  function move(dx: number, dy: number) {
    const current = ref.current?.getState();
    if (!current || !ready || !geometry) return;
    // Viewport-sized steps retain 20% context for inspecting seams; stepping a
    // whole image width would skip detail. Physical directions do not mirror in RTL.
    const x = Math.max(-geometry.panBounds.x, Math.min(geometry.panBounds.x, current.translateX - dx * viewport.width * 0.8));
    const y = Math.max(-geometry.panBounds.y, Math.min(geometry.panBounds.y, current.translateY - dy * viewport.height * 0.8));
    ref.current?.setTransformState({ translateX: x, translateY: y, scale: 1 }, false);
    commitPosition(-x, -y);
  }
  function center() {
    if (!ready) return;
    ref.current?.reset(false);
    commitPosition(0, 0);
  }
  const positionText = config.getPositionText({ x: position.identity === identity ? position.x : 0,
    y: position.identity === identity ? position.y : 0,
    maxX: geometry?.panBounds.x ?? 0, maxY: geometry?.panBounds.y ?? 0 });
  if (!positionText.trim()) throw new TypeError("Image inspection position text must not be empty");
  return <View style={{ flex: 1, minHeight: 0 }}>
    <View style={{ flex: 1, minHeight: 0, overflow: "hidden" }} onLayout={event => {
      const { width, height } = event.nativeEvent.layout;
      if (width >= 0 && height >= 0) setViewport({ width, height });
    }}>
      {geometry ? <ResumableZoom ref={ref} key={key} style={{ flex: 1 }} minScale={1} maxScale={1}
        pinchEnabled={false} tapsEnabled={false} panEnabled={ready} panMode="clamp"
        onGestureEnd={() => {
          const current = ref.current?.getState();
          if (current) commitPosition(-current.translateX, -current.translateY);
        }}>{renderImage(geometry.width, geometry.height, status => setReported({ identity, status }))}</ResumableZoom> : null}
      {status !== "ready" ? <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", ...controlsInset }}>
        <Surface padding="md"><Text accessibilityLiveRegion={status === "error" ? "assertive" : "polite"}>{status === "error" ? feedbackLabels.error : feedbackLabels.loading}</Text>
          {status === "error" ? <Button growWithContent onPress={() => setAttempt(value => value + 1)}>{feedbackLabels.retry}</Button> : null}
        </Surface>
      </View> : null}
    </View>
    <View style={controlsInset}>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Button growWithContent tone="ghost" disabled={!ready || !geometry?.panBounds.x} onPress={() => move(-1, 0)}>{config.labels.left}</Button>
        <Button growWithContent tone="ghost" disabled={!ready || !geometry?.panBounds.x} onPress={() => move(1, 0)}>{config.labels.right}</Button>
        <Button growWithContent tone="ghost" disabled={!ready || !geometry?.panBounds.y} onPress={() => move(0, -1)}>{config.labels.up}</Button>
        <Button growWithContent tone="ghost" disabled={!ready || !geometry?.panBounds.y} onPress={() => move(0, 1)}>{config.labels.down}</Button>
        <Button growWithContent tone="ghost" disabled={!ready} onPress={center}>{config.labels.center}</Button>
      </View>
      {/* A stable caption height prevents status wrapping from resizing the image
          and resetting the pan that the user just requested. */}
      <Text accessibilityLiveRegion="polite" accessibilityLabel={positionText} numberOfLines={1} variant="caption">{positionText}</Text>
    </View>
  </View>;
}
