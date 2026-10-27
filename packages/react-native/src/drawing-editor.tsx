import { useEffect, useReducer, useRef, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { EditorScreen } from './screen-flows.js';
import { SegmentedControl } from './inputs.js';
import { Sheet } from './overlays.js';
import { ColorPicker, ColorSwatchPicker } from './color-picker.js';
import { Slider } from './slider.js';
import { Notice } from './feedback.js';
import { IconButton } from './actions.js';
import { Icon } from './primitives.js';
import { useHjmNativeTheme } from './provider.js';
import {
  DRAWING_BACKGROUND_COLORS, DRAWING_INK_COLORS, DRAWING_PAPER, drawingInkPath, drawingReducer, emptyDrawing, drawingHasContent,
  drawingQuickColors, drawingStrokeColor, drawingEditorRecipe, type DrawingStroke, type DrawingEditorProps,
} from '@hjmds/design-contracts/components/drawing-editor';
import { PaintBucket, Palette, Redo2, Trash2, Undo2 } from 'lucide-react-native';
export type { DrawingEditorProps, DrawingEditorLabels, DrawingImage } from '@hjmds/design-contracts/components/drawing-editor';

/** Canvas edge cap: big enough to draw comfortably, small enough to leave the tool rows on screen without scrolling. */
const MAX_CANVAS = drawingEditorRecipe.maxCanvas;
/** How long the brush-size circle stays on the canvas after the size slider is released. */
const SIZE_PREVIEW_MS = drawingEditorRecipe.sizePreviewMs;

/** Shared paint editor extracted from Diairy and Spint (2026-10-27).
 * Tools, history, crop preview and failed-save draft preservation have one owner per renderer.
 * The product supplies localized labels, upload and navigation; SVG/lucide stay optional entry peers. */
export function DrawingEditor({ labels, onSave, onCancel, cropPreview = 'none', safeAreaBottom = 0, testID = 'drawing-editor' }: DrawingEditorProps) {
  const { colors } = useHjmNativeTheme();
  const [history, dispatch] = useReducer(drawingReducer, emptyDrawing);
  const [draft, setDraft] = useState<DrawingStroke | null>(null);
  const strokes = draft ? [...history.present, draft] : history.present;
  const [brushWidth, setBrushWidth] = useState<number>(drawingEditorRecipe.brush.initial);
  const [colorOpen, setColorOpen] = useState(false);
  const [color, setColor] = useState<string>(DRAWING_INK_COLORS[0]);
  const [background, setBackground] = useState<string>(DRAWING_PAPER);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [sizePreview, setSizePreview] = useState(false);
  const sizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (sizeTimer.current) clearTimeout(sizeTimer.current); }, []);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [canvas, setCanvas] = useState(0);
  const active = useRef<DrawingStroke | null>(null);
  const activeTouch = useRef<string | number | null>(null);
  const svg = useRef<Svg>(null);
  const hasInk = drawingHasContent(strokes, background);
  // Pen and eraser share the slider value: the size shown is the size drawn (2026-10-25; a hidden 2× eraser confused people).
  const strokeWidth = brushWidth;
  const quickColors = drawingQuickColors(recent);
  const scale = canvas / 256;
  const point = (x: number, y: number): [number, number] => [
    Math.max(0, Math.min(256, x / scale)),
    Math.max(0, Math.min(256, y / scale)),
  ];
  const finishStroke = () => {
    if (active.current) dispatch({ type: 'add', stroke: active.current });
    active.current = null; activeTouch.current = null; setDraft(null);
  };
  // A second finger must neither add its points to this stroke nor keep it alive after the owner lifts
  // (the same ownership rule as the handwriting pad, QA BUG-W71).
  const ownerTouch = (event: GestureResponderEvent) =>
    event.nativeEvent.changedTouches?.find(touch => touch.identifier === activeTouch.current)
    ?? (event.nativeEvent.identifier === activeTouch.current ? event.nativeEvent : null);
  const pickColor = (next: string) => { setColor(next); setTool('pen'); };
  const closeColors = (open: boolean) => {
    setColorOpen(open);
    if (!open) setRecent(previous => previous.includes(color) || quickColors.includes(color) ? previous : [color, ...previous].slice(0, 4));
  };
  const paths = strokes.map((stroke, index) => <Path key={index} d={drawingInkPath(stroke)} stroke={drawingStrokeColor(stroke, background)} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
  const store = async () => {
    if (saving.current || busy || draft || !hasInk) return;
    saving.current = true; setBusy(true); setFailed(false);
    try {
      const photo = await new Promise<string>((resolve, reject) => {
        if (!svg.current) return reject(new Error('drawing_not_ready'));
        svg.current.toDataURL(resolve);
      });
      await onSave({ base64: photo, mimeType: 'image/png' });
    } catch { setFailed(true); } finally { saving.current = false; setBusy(false); }
  };
  const glyphs = { undo: Undo2, redo: Redo2, clear: Trash2, palette: Palette, background: PaintBucket };
  const glyph = (name: keyof typeof glyphs) => <Icon descriptor={{ name, decorative: true }} renderGlyph={({ name: mark, size, color, strokeWidth }) => {
    const Glyph = glyphs[mark as keyof typeof glyphs];
    return <Glyph size={size} color={color} strokeWidth={strokeWidth} />;
  }} />;
  const showSize = (width: number) => {
    setBrushWidth(width); setSizePreview(true);
    if (sizeTimer.current) clearTimeout(sizeTimer.current);
  };
  const hideSize = () => {
    if (sizeTimer.current) clearTimeout(sizeTimer.current);
    sizeTimer.current = setTimeout(() => setSizePreview(false), SIZE_PREVIEW_MS);
  };
  const lastPoint = draft?.points.at(-1);

  return <EditorScreen testID={testID} title={labels.title} safeAreaBottom={safeAreaBottom} scroll="content" initialFocus="none"
    dirty={hasInk}
    submit={{ label: labels.save, disabled: !hasInk || !!draft, pending: busy, onAction: () => void store() }}
    cancel={{ label: labels.close, disabled: busy, onAction: onCancel }}
    discard={{ mode: 'confirm', title: labels.discardTitle, description: labels.discardBody, confirmLabel: labels.discardConfirm,
      cancelLabel: labels.cancel, fallbackErrorMessage: labels.failed }}
    notice={failed ? <Notice tone="danger" title={labels.failed} /> : undefined}>
    <View style={{ flex: 1, gap: drawingEditorRecipe.gap }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <IconButton label={labels.undo} tone="ghost" disabled={busy || !!draft || !history.past.length} onPress={() => dispatch({ type: 'undo' })}>{glyph('undo')}</IconButton>
          <IconButton label={labels.redo} tone="ghost" disabled={busy || !!draft || !history.future.length} onPress={() => dispatch({ type: 'redo' })}>{glyph('redo')}</IconButton>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <IconButton label={labels.background} tone="ghost" disabled={busy || !!draft} onPress={() => setBackgroundOpen(true)}>{glyph('background')}</IconButton>
          <IconButton label={labels.clear} tone="ghost" disabled={busy || !!draft || !strokes.length} onPress={() => dispatch({ type: 'clear' })}>{glyph('clear')}</IconButton>
        </View>
      </View>
      <View style={{ flex: 1, minHeight: drawingEditorRecipe.minCanvas, alignItems: 'center', justifyContent: 'center' }}
        onLayout={event => { const { width, height } = event.nativeEvent.layout; setCanvas(Math.floor(Math.min(width, height, MAX_CANVAS))); }}>
        {canvas ? <View testID={`${testID}-canvas`} accessibilityLabel={labels.title}
          style={{ width: canvas, height: canvas, borderRadius: drawingEditorRecipe.radius, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}
          onStartShouldSetResponder={() => !busy} onMoveShouldSetResponder={() => !busy}
          onResponderGrant={event => {
            if (busy || active.current) return;
            activeTouch.current = event.nativeEvent.identifier;
            const points: [number, number][] = [point(event.nativeEvent.locationX, event.nativeEvent.locationY)];
            active.current = tool === 'eraser' ? { erase: true, width: strokeWidth, points } : { color, width: strokeWidth, points };
            setDraft(active.current);
          }}
          onResponderMove={event => {
            const touch = ownerTouch(event);
            if (!active.current || !touch) return;
            active.current = { ...active.current, points: [...active.current.points, point(touch.locationX, touch.locationY)] };
            setDraft(active.current);
          }}
          onResponderEnd={event => { if (ownerTouch(event)) finishStroke(); }}
          onResponderRelease={finishStroke}
          // A stroke keeps its touch: no parent gesture may claim it mid-line.
          onResponderTerminationRequest={() => false}
          onResponderTerminate={finishStroke}>
          <Svg ref={svg} pointerEvents="none" width={canvas} height={canvas} viewBox="0 0 256 256"><Rect width="256" height="256" fill={background} />{paths}</Svg>
          {/* The saved photo is shown as a circle; shade the corners it will lose. Not part of the exported image. */}
          <Svg pointerEvents="none" width={canvas} height={canvas} viewBox="0 0 256 256" style={{ position: 'absolute', top: 0, left: 0 }}>
            {cropPreview === 'circle' ? <><Path d="M0 0H256V256H0Z M128 0A128 128 0 1 0 128 256A128 128 0 1 0 128 0Z" fillRule="evenodd" fill={colors.textBody} fillOpacity={0.06} />
            <Circle cx={128} cy={128} r={127} stroke={colors.textMuted} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="4 4" fill="none" /></> : null}
            {/* Brush size at its real scale: filled in the centre while the slider moves, a ring under the stroke end. */}
            {sizePreview && !draft ? <Circle cx={128} cy={128} r={strokeWidth / 2} fill={tool === 'eraser' ? background : color} stroke={colors.textBody} strokeOpacity={0.4} strokeWidth={1 / (scale || 1)} /> : null}
            {lastPoint ? <Circle cx={lastPoint[0]} cy={lastPoint[1]} r={strokeWidth / 2 + 1} fill="none" stroke={colors.textBody} strokeOpacity={0.5} strokeWidth={1 / (scale || 1)} /> : null}
          </Svg>
        </View> : null}
      </View>
      <SegmentedControl label={labels.pen} value={tool} onValueChange={value => setTool(value as 'pen' | 'eraser')} disabled={busy} items={[
        { value: 'pen', label: labels.pen }, { value: 'eraser', label: labels.eraser },
      ]} />
      <Slider label={labels.width} min={drawingEditorRecipe.brush.min} max={drawingEditorRecipe.brush.max} step={drawingEditorRecipe.brush.step} value={brushWidth}
        onValueChange={showSize} onValueChangeEnd={hideSize} disabled={busy} decrementLabel={`${labels.width} −`} incrementLabel={`${labels.width} +`} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <ColorSwatchPicker label={labels.penColor} labelVisibility="hidden" layout="scroll" layoutStyle={{ flex: 1 }}
          colors={quickColors} value={tool === 'pen' && quickColors.includes(color) ? color : null} onValueChange={pickColor} disabled={busy} />
        <IconButton label={labels.moreColors} tone="secondary" disabled={busy} onPress={() => setColorOpen(true)}>{glyph('palette')}</IconButton>
      </View>
    </View>
    <Sheet open={colorOpen} onOpenChange={closeColors} title={labels.moreColors} closeLabel={labels.close}>
      <ColorPicker label={labels.penColor} value={color} onValueChange={pickColor} disabled={busy}
        labels={{ hex: labels.hex, hue: labels.hue, saturation: labels.saturation, brightness: labels.brightness,
          opacity: labels.opacity, invalid: labels.invalidColor }} />
    </Sheet>
    <Sheet open={backgroundOpen} onOpenChange={setBackgroundOpen} title={labels.background} closeLabel={labels.close}>
      <ColorPicker label={labels.background} value={background} onValueChange={setBackground} disabled={busy} presets={DRAWING_BACKGROUND_COLORS}
        labels={{ hex: labels.hex, hue: labels.hue, saturation: labels.saturation, brightness: labels.brightness,
          opacity: labels.opacity, invalid: labels.invalidColor, presets: labels.backgroundPresets }} />
    </Sheet>
  </EditorScreen>;
}
