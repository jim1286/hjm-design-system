'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useReducer, useRef, useState } from 'react';
import { PaintBucket, Redo2, Palette, Trash2, Undo2 } from 'lucide-react';
import { EditorScreen } from './screen-flows.js';
import { Stack } from './layout.js';
import { SegmentedControl } from './selection.js';
import { ColorPicker, ColorSwatchPicker } from './color-picker.js';
import { Slider } from './slider.js';
import { Sheet } from './overlays.js';
import { Notice } from './feedback.js';
import { IconButton } from './actions.js';
import { DRAWING_BACKGROUND_COLORS, DRAWING_INK_COLORS, DRAWING_PAPER, drawingInkPath, drawingReducer, emptyDrawing, drawingHasContent, drawingQuickColors, drawingStrokeColor, drawingEditorRecipe, } from '@hjmds/design-contracts/components/drawing-editor';
/** How long the brush-size circle stays on the canvas after the size slider is released. */
const SIZE_PREVIEW_MS = drawingEditorRecipe.sizePreviewMs;
/** Shared paint editor extracted from Diairy and Spint (2026-10-27).
 * Tools, history, crop preview and failed-save draft preservation have one owner per renderer.
 * The product supplies localized labels, upload and navigation; SVG/lucide stay optional entry peers. */
export function DrawingEditor({ labels, onSave, onCancel, cropPreview = 'none', testID = 'drawing-editor', layoutStyle }) {
    const [history, dispatch] = useReducer(drawingReducer, emptyDrawing);
    const [draft, setDraft] = useState(null);
    const strokes = draft ? [...history.present, draft] : history.present;
    const [brushWidth, setBrushWidth] = useState(drawingEditorRecipe.brush.initial);
    const [colorOpen, setColorOpen] = useState(false);
    const [color, setColor] = useState(DRAWING_INK_COLORS[0]);
    const [background, setBackground] = useState(DRAWING_PAPER);
    const [backgroundOpen, setBackgroundOpen] = useState(false);
    const [sizePreview, setSizePreview] = useState(false);
    const [pointer, setPointer] = useState(null);
    const sizeTimer = useRef(null);
    useEffect(() => () => { if (sizeTimer.current)
        clearTimeout(sizeTimer.current); }, []);
    const [recent, setRecent] = useState([]);
    const [tool, setTool] = useState('pen');
    const saving = useRef(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    const active = useRef(null);
    const svg = useRef(null);
    const hasInk = drawingHasContent(strokes, background);
    // Pen and eraser share the slider value: the size shown is the size drawn (2026-10-25; a hidden 2× eraser confused people).
    const strokeWidth = brushWidth;
    const quickColors = drawingQuickColors(recent);
    const point = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return [Math.max(0, Math.min(256, (event.clientX - rect.left) / rect.width * 256)), Math.max(0, Math.min(256, (event.clientY - rect.top) / rect.height * 256))];
    };
    const finishStroke = (event) => {
        if (!active.current || active.current.pointer !== event.pointerId)
            return;
        dispatch({ type: 'add', stroke: active.current.stroke });
        active.current = null;
        setDraft(null);
    };
    const pickColor = (next) => { setColor(next); setTool('pen'); };
    const closeColors = (open) => {
        setColorOpen(open);
        if (!open)
            setRecent(previous => previous.includes(color) || quickColors.includes(color) ? previous : [color, ...previous].slice(0, 4));
    };
    const paths = strokes.map((stroke, index) => _jsx("path", { d: drawingInkPath(stroke), stroke: drawingStrokeColor(stroke, background), strokeWidth: stroke.width, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }, index));
    const store = async () => {
        if (saving.current || busy || draft || !svg.current || !hasInk)
            return;
        saving.current = true;
        setBusy(true);
        setFailed(false);
        try {
            const markup = new XMLSerializer().serializeToString(svg.current);
            const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
            let photo;
            try {
                const image = new Image();
                await new Promise((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('drawing_decode')); image.src = url; });
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 512;
                const context = canvas.getContext('2d');
                if (!context)
                    throw new Error('drawing_canvas');
                context.drawImage(image, 0, 0, 512, 512);
                photo = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
            }
            finally {
                URL.revokeObjectURL(url);
            }
            await onSave({ base64: photo, mimeType: 'image/jpeg' });
        }
        catch {
            setFailed(true);
        }
        finally {
            saving.current = false;
            setBusy(false);
        }
    };
    const showSize = (width) => { setBrushWidth(width); setSizePreview(true); if (sizeTimer.current)
        clearTimeout(sizeTimer.current); };
    const hideSize = () => { if (sizeTimer.current)
        clearTimeout(sizeTimer.current); sizeTimer.current = setTimeout(() => setSizePreview(false), SIZE_PREVIEW_MS); };
    return _jsxs(EditorScreen, { as: "section", title: labels.title, initialFocus: "none", dirty: hasInk, ...(layoutStyle === undefined ? {} : { layoutStyle }), submit: { label: labels.save, disabled: !hasInk || !!draft, pending: busy, onAction: () => void store() }, cancel: { label: labels.close, disabled: busy, onAction: onCancel }, discard: { mode: 'confirm', title: labels.discardTitle, description: labels.discardBody, confirmLabel: labels.discardConfirm,
            cancelLabel: labels.cancel, fallbackErrorMessage: labels.failed }, notice: failed ? _jsx(Notice, { tone: "danger", title: labels.failed }) : undefined, children: [_jsxs(Stack, { gap: "md", layoutStyle: { width: '100%', maxWidth: drawingEditorRecipe.maxCanvas, marginInline: 'auto' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { style: { display: 'flex' }, children: [_jsx(IconButton, { label: labels.undo, tone: "ghost", disabled: busy || !!draft || !history.past.length, onClick: () => dispatch({ type: 'undo' }), children: _jsx(Undo2, { "aria-hidden": true, size: 20 }) }), _jsx(IconButton, { label: labels.redo, tone: "ghost", disabled: busy || !!draft || !history.future.length, onClick: () => dispatch({ type: 'redo' }), children: _jsx(Redo2, { "aria-hidden": true, size: 20 }) })] }), _jsxs("div", { style: { display: 'flex' }, children: [_jsx(IconButton, { label: labels.background, tone: "ghost", disabled: busy || !!draft, onClick: () => setBackgroundOpen(true), children: _jsx(PaintBucket, { "aria-hidden": true, size: 20 }) }), _jsx(IconButton, { label: labels.clear, tone: "ghost", disabled: busy || !!draft || !strokes.length, onClick: () => dispatch({ type: 'clear' }), children: _jsx(Trash2, { "aria-hidden": true, size: 20 }) })] })] }), _jsxs("div", { style: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: drawingEditorRecipe.radius, overflow: 'hidden', border: '1px solid var(--hjm-color-border)' }, children: [_jsxs("svg", { ref: svg, xmlns: "http://www.w3.org/2000/svg", width: "512", height: "512", viewBox: "0 0 256 256", role: "img", "aria-label": labels.title, "data-testid": `${testID}-canvas`, 
                                // touch-action none keeps a stroke from scrolling the page; the pointer capture keeps it on the canvas.
                                style: { display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }, onPointerDown: event => {
                                    if (busy || active.current || event.button !== 0)
                                        return;
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    const points = [point(event)];
                                    const stroke = tool === 'eraser' ? { erase: true, width: strokeWidth, points } : { color, width: strokeWidth, points };
                                    active.current = { pointer: event.pointerId, stroke };
                                    setDraft(stroke);
                                }, onPointerMove: event => {
                                    // The size ring follows a hovering mouse or pen as well as an active stroke.
                                    setPointer(point(event));
                                    if (!active.current || active.current.pointer !== event.pointerId)
                                        return;
                                    const stroke = { ...active.current.stroke, points: [...active.current.stroke.points, point(event)] };
                                    active.current = { pointer: event.pointerId, stroke };
                                    setDraft(stroke);
                                }, onPointerUp: finishStroke, onPointerCancel: finishStroke, onPointerLeave: () => setPointer(null), children: [_jsx("rect", { width: "256", height: "256", fill: background }), paths] }), _jsxs("svg", { "aria-hidden": true, viewBox: "0 0 256 256", style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }, children: [cropPreview === 'circle' ? _jsxs(_Fragment, { children: [_jsx("path", { d: "M0 0H256V256H0Z M128 0A128 128 0 1 0 128 256A128 128 0 1 0 128 0Z", fillRule: "evenodd", style: { fill: 'var(--hjm-color-text)', fillOpacity: 0.06 } }), _jsx("circle", { cx: "128", cy: "128", r: "127", fill: "none", strokeWidth: "1", strokeDasharray: "4 4", style: { stroke: 'var(--hjm-color-text-muted)', strokeOpacity: 0.5 } })] }) : null, sizePreview && !draft ? _jsx("circle", { "data-testid": `${testID}-size`, cx: "128", cy: "128", r: strokeWidth / 2, fill: tool === 'eraser' ? background : color, strokeWidth: "0.5", style: { stroke: 'var(--hjm-color-text)', strokeOpacity: 0.4 } }) : null, pointer && !busy ? _jsx("circle", { cx: pointer[0], cy: pointer[1], r: strokeWidth / 2 + 1, fill: "none", strokeWidth: "0.5", style: { stroke: 'var(--hjm-color-text)', strokeOpacity: 0.5 } }) : null] })] }), _jsx(SegmentedControl, { value: tool, onValueChange: setTool, disabled: busy, label: labels.pen, items: [{ value: 'pen', label: labels.pen }, { value: 'eraser', label: labels.eraser }] }), _jsx(Slider, { label: labels.width, min: drawingEditorRecipe.brush.min, max: drawingEditorRecipe.brush.max, step: drawingEditorRecipe.brush.step, value: brushWidth, onValueChange: showSize, onValueChangeEnd: hideSize, disabled: busy }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx(ColorSwatchPicker, { label: labels.penColor, labelVisibility: "hidden", layout: "scroll", layoutStyle: { flex: 1, minWidth: 0 }, colors: quickColors, value: tool === 'pen' && quickColors.includes(color) ? color : null, onValueChange: pickColor, disabled: busy }), _jsx(IconButton, { label: labels.moreColors, tone: "secondary", disabled: busy, onClick: () => setColorOpen(true), children: _jsx(Palette, { "aria-hidden": true, size: 20 }) })] })] }), _jsx(Sheet, { open: colorOpen, onOpenChange: closeColors, title: labels.moreColors, closeLabel: labels.close, children: _jsx(ColorPicker, { label: labels.penColor, value: color, onValueChange: pickColor, disabled: busy, labels: { hex: labels.hex, hue: labels.hue, saturation: labels.saturation, brightness: labels.brightness,
                        opacity: labels.opacity, invalid: labels.invalidColor } }) }), _jsx(Sheet, { open: backgroundOpen, onOpenChange: setBackgroundOpen, title: labels.background, closeLabel: labels.close, children: _jsx(ColorPicker, { label: labels.background, value: background, onValueChange: setBackground, disabled: busy, presets: DRAWING_BACKGROUND_COLORS, labels: { hex: labels.hex, hue: labels.hue, saturation: labels.saturation, brightness: labels.brightness,
                        opacity: labels.opacity, invalid: labels.invalidColor, presets: labels.backgroundPresets } }) })] });
}
//# sourceMappingURL=drawing-editor.js.map