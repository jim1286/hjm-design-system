import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, View } from 'react-native';
import Svg, { Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';
import { colorPickerRecipe, normalizePickerColor, pickerHexFromHsv, pickerHsv, pickerHueColor, pickerHueStops, pickerOpacity, withPickerOpacity, } from '@hjmds/design-contracts/components/color-picker';
import { radius, spacing } from '@hjmds/design-contracts/foundations';
import { TextField } from './inputs.js';
import { Slider } from './slider.js';
import { Text } from './primitives.js';
import { useHjmNativeTheme } from './provider.js';
const ColorBar = Slider;
const svgId = (id) => id.replace(/[^a-zA-Z0-9]/g, '');
/** Light/grey checkerboard under transparent colours, as every editor draws it. */
function Checker({ id }) {
    return _jsxs(_Fragment, { children: [_jsx(Defs, { children: _jsxs(Pattern, { id: `hjmChecker${id}`, width: 12, height: 12, patternUnits: "userSpaceOnUse", children: [_jsx(Rect, { width: 12, height: 12, fill: "#ffffff" }), _jsx(Rect, { width: 6, height: 6, fill: "#d6d6d6" }), _jsx(Rect, { x: 6, y: 6, width: 6, height: 6, fill: "#d6d6d6" })] }) }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#hjmChecker${id})` })] });
}
/**
 * Controlled sRGB HEX value edited as HSV: a saturation/brightness area, a hue bar, an optional opacity bar, HEX text
 * and preset swatches (2026-10-25 redesign; the first Native candidate used RGB channel sliders). Requires
 * `react-native-svg` for the gradients, like Chart.
 */
export function ColorPicker({ label, labels, value, onValueChange, alpha = false, disabled = false, presets = [], getPresetLabel, layoutStyle }) {
    const color = normalizePickerColor(value, alpha);
    const palette = [...new Set(presets.map(preset => normalizePickerColor(preset, alpha)))];
    if (![label, labels.hex, labels.hue, labels.saturation, labels.brightness, labels.opacity, labels.invalid].every(text => text.trim()))
        throw new TypeError('ColorPicker labels must not be empty');
    if (palette.length && !labels.presets?.trim())
        throw new TypeError('ColorPicker presets need labels.presets');
    const { colors } = useHjmNativeTheme();
    const id = svgId(useId());
    const opaque = color.slice(0, 7);
    const suffix = alpha ? color.slice(7) : '';
    const [hsv, setHsv] = useState(() => pickerHsv(color));
    const hsvRef = useRef(hsv);
    hsvRef.current = hsv;
    // An external value replaces the HSV only when it names a different colour, so hue survives black and greys.
    useEffect(() => { setHsv(previous => pickerHexFromHsv(previous) === opaque ? previous : pickerHsv(opaque, previous)); }, [opaque]);
    const [draft, setDraft] = useState(color);
    const [invalid, setInvalid] = useState(false);
    const changed = useRef(false);
    useEffect(() => { setDraft(color); setInvalid(false); changed.current = false; }, [color]);
    const emitRef = useRef(() => undefined);
    const emit = (next) => {
        if (disabled)
            return;
        changed.current = false;
        setDraft(next);
        setInvalid(false);
        if (next !== color)
            onValueChange(next);
    };
    emitRef.current = emit;
    const emitHsv = (next) => { if (disabled)
        return; hsvRef.current = next; setHsv(next); emitRef.current(pickerHexFromHsv(next) + suffix); };
    const emitHsvRef = useRef(emitHsv);
    emitHsvRef.current = emitHsv;
    const commit = () => {
        if (disabled || !changed.current)
            return;
        try {
            const digits = draft.trim().replace(/^#/, '').length;
            emit(alpha && (digits === 3 || digits === 6) ? normalizePickerColor(draft, false) + suffix : normalizePickerColor(draft, alpha));
        }
        catch {
            setInvalid(true);
        }
    };
    const area = useRef({ width: 0, height: 0 });
    const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });
    const disabledRef = useRef(disabled);
    disabledRef.current = disabled;
    // Every direction is meaningful in a 2D area, so it claims the touch at once and never yields to a parent scroll:
    // a Sheet or screen that scrolled under the finger made the colour jump (2026-10-25 Diairy drawing report).
    const responder = useMemo(() => {
        const update = (x, y) => {
            const { width, height } = area.current;
            if (!width || !height || disabledRef.current)
                return;
            emitHsvRef.current({ ...hsvRef.current, saturation: Math.min(1, Math.max(0, x / width)) * 100, brightness: (1 - Math.min(1, Math.max(0, y / height))) * 100 });
        };
        return PanResponder.create({
            onStartShouldSetPanResponder: () => !disabledRef.current,
            onMoveShouldSetPanResponder: () => !disabledRef.current,
            onPanResponderGrant: event => update(event.nativeEvent.locationX, event.nativeEvent.locationY),
            onPanResponderMove: event => update(event.nativeEvent.locationX, event.nativeEvent.locationY),
            onPanResponderTerminationRequest: () => false,
            onShouldBlockNativeResponder: () => true,
        });
    }, []);
    const { step, largeStep } = colorPickerRecipe;
    const nudge = (channel, delta) => {
        const current = hsvRef.current[channel];
        emitHsv({ ...hsvRef.current, [channel]: Math.min(100, Math.max(0, Math.round(current) + delta)) });
    };
    const thumb = colorPickerRecipe.area.thumbDiameter;
    const bar = colorPickerRecipe.bar;
    const opacity = pickerOpacity(color);
    const thumbShadow = { elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2 };
    return _jsxs(View, { style: [{ gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, opacity: disabled ? 0.5 : 1 }, layoutStyle], children: [_jsx(Text, { variant: "label", children: label }), _jsxs(View, { ...responder.panHandlers, accessible: true, accessibilityRole: "adjustable", accessibilityLabel: `${labels.brightness}, ${labels.saturation}`, accessibilityValue: { text: `${labels.brightness} ${Math.round(hsv.brightness)}%, ${labels.saturation} ${Math.round(hsv.saturation)}%` }, accessibilityState: { disabled }, accessibilityActions: disabled ? [] : [
                    { name: 'increment', label: `${labels.brightness} +` }, { name: 'decrement', label: `${labels.brightness} −` },
                    { name: 'saturationIncrement', label: `${labels.saturation} +` }, { name: 'saturationDecrement', label: `${labels.saturation} −` },
                ], onAccessibilityAction: event => {
                    const action = event.nativeEvent.actionName;
                    if (action === 'increment')
                        nudge('brightness', largeStep);
                    if (action === 'decrement')
                        nudge('brightness', -largeStep);
                    if (action === 'saturationIncrement')
                        nudge('saturation', largeStep);
                    if (action === 'saturationDecrement')
                        nudge('saturation', -largeStep);
                }, onLayout: (event) => { const { width, height } = event.nativeEvent.layout; area.current = { width, height }; setAreaSize({ width, height }); }, style: { width: '100%', aspectRatio: colorPickerRecipe.area.aspectRatio, borderRadius: radius[colorPickerRecipe.area.radius], direction: 'ltr' }, children: [_jsx(View, { pointerEvents: "none", style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius[colorPickerRecipe.area.radius], overflow: 'hidden' }, children: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsxs(Defs, { children: [_jsxs(LinearGradient, { id: `hjmWhite${id}`, x1: "0", y1: "0", x2: "1", y2: "0", children: [_jsx(Stop, { offset: "0", stopColor: "#ffffff", stopOpacity: 1 }), _jsx(Stop, { offset: "1", stopColor: "#ffffff", stopOpacity: 0 })] }), _jsxs(LinearGradient, { id: `hjmBlack${id}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx(Stop, { offset: "0", stopColor: "#000000", stopOpacity: 0 }), _jsx(Stop, { offset: "1", stopColor: "#000000", stopOpacity: 1 })] })] }), _jsx(Rect, { width: "100%", height: "100%", fill: pickerHueColor(hsv.hue) }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#hjmWhite${id})` }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#hjmBlack${id})` })] }) }), _jsx(View, { pointerEvents: "none", style: { position: 'absolute', width: thumb, height: thumb, borderRadius: thumb / 2, borderWidth: colorPickerRecipe.area.thumbBorder, borderColor: '#ffffff', backgroundColor: opaque,
                            left: hsv.saturation / 100 * areaSize.width - thumb / 2, top: (1 - hsv.brightness / 100) * areaSize.height - thumb / 2, ...thumbShadow } })] }), _jsx(ColorBar, { label: labels.hue, min: 0, max: 360, step: step, value: Math.round(hsv.hue), disabled: disabled, decrementLabel: `${labels.hue} −`, incrementLabel: `${labels.hue} +`, getValueText: next => `${next}°`, onValueChange: next => emitHsv({ ...hsvRef.current, hue: next }), hjmColorTrack: { height: bar.height, thumbDiameter: bar.thumbDiameter, thumbBorder: bar.thumbBorder,
                    fill: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsx(Defs, { children: _jsx(LinearGradient, { id: `hjmHue${id}`, x1: "0", y1: "0", x2: "1", y2: "0", children: pickerHueStops.map(stop => _jsx(Stop, { offset: String(stop.offset), stopColor: stop.color }, stop.offset)) }) }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#hjmHue${id})` })] }),
                    thumbFill: _jsx(View, { style: { flex: 1, backgroundColor: pickerHueColor(hsv.hue) } }) } }), alpha ? _jsx(ColorBar, { label: labels.opacity, min: 0, max: 100, step: step, value: opacity, disabled: disabled, decrementLabel: `${labels.opacity} −`, incrementLabel: `${labels.opacity} +`, getValueText: next => `${next}%`, onValueChange: next => emit(withPickerOpacity(color, next)), hjmColorTrack: { height: bar.height, thumbDiameter: bar.thumbDiameter, thumbBorder: bar.thumbBorder,
                    fill: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsx(Checker, { id: `a${id}` }), _jsx(Defs, { children: _jsxs(LinearGradient, { id: `hjmAlpha${id}`, x1: "0", y1: "0", x2: "1", y2: "0", children: [_jsx(Stop, { offset: "0", stopColor: opaque, stopOpacity: 0 }), _jsx(Stop, { offset: "1", stopColor: opaque, stopOpacity: 1 })] }) }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#hjmAlpha${id})` })] }),
                    thumbFill: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsx(Checker, { id: `t${id}` }), _jsx(Rect, { width: "100%", height: "100%", fill: opaque, fillOpacity: opacity / 100 })] }) } }) : null, _jsxs(View, { style: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }, children: [_jsx(View, { accessible: false, importantForAccessibility: "no-hide-descendants", accessibilityElementsHidden: true, style: { width: colorPickerRecipe.preview.size, height: colorPickerRecipe.preview.size, borderRadius: colorPickerRecipe.preview.size / 2, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }, children: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsx(Checker, { id: `p${id}` }), _jsx(Rect, { width: "100%", height: "100%", fill: opaque, fillOpacity: alpha ? opacity / 100 : 1 })] }) }), _jsx(View, { style: { flex: 1, minWidth: 0 }, children: _jsx(TextField, { label: labels.hex, value: draft, disabled: disabled, autoCapitalize: "none", autoCorrect: false, onValueChange: next => { changed.current = true; setDraft(next); setInvalid(false); }, onBlur: commit, onSubmitEditing: commit, ...(invalid ? { error: labels.invalid } : {}) }) }), alpha ? _jsx(View, { style: { minHeight: colorPickerRecipe.minTargetSize, justifyContent: 'center' }, children: _jsx(Text, { variant: "caption", tone: "muted", children: `${opacity}%` }) }) : null] }), palette.length ? _jsx(ColorSwatchPicker, { label: labels.presets, colors: palette, value: color, alpha: alpha, disabled: disabled, onValueChange: emit, ...(getPresetLabel ? { getColorLabel: getPresetLabel } : {}) }) : null] });
}
/**
 * A single choice among round colour swatches with radio semantics. Shared by ColorPicker presets and quick colour
 * rows such as a drawing toolbar, so products do not rebuild swatch buttons and selection rings.
 */
export function ColorSwatchPicker({ label, colors: swatchColors, value, onValueChange, alpha = false, disabled = false, getColorLabel, layout = 'wrap', labelVisibility = 'visible', layoutStyle }) {
    if (!label.trim())
        throw new TypeError('ColorSwatchPicker label must not be empty');
    const { colors } = useHjmNativeTheme();
    const swatches = [...new Set(swatchColors.map(color => normalizePickerColor(color, alpha)))];
    const selected = value === null ? null : normalizePickerColor(value, alpha);
    const { swatch } = colorPickerRecipe;
    const items = swatches.map(color => {
        const checked = color === selected;
        return _jsx(Pressable, { accessibilityRole: "radio", accessibilityLabel: getColorLabel?.(color) ?? color, accessibilityState: { checked, disabled }, disabled: disabled, onPress: () => { if (!checked)
                onValueChange(color); }, style: { width: swatch.target, height: swatch.target, alignItems: 'center', justifyContent: 'center' }, children: _jsx(View, { style: { width: swatch.diameter + (swatch.ringGap + swatch.ringWidth) * 2, height: swatch.diameter + (swatch.ringGap + swatch.ringWidth) * 2,
                    borderRadius: swatch.target, borderWidth: swatch.ringWidth, borderColor: checked ? colors.textBody : 'transparent', alignItems: 'center', justifyContent: 'center' }, children: _jsx(View, { style: { width: swatch.diameter, height: swatch.diameter, borderRadius: swatch.diameter / 2, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' } }) }) }, color);
    });
    return _jsxs(View, { accessibilityRole: "radiogroup", accessibilityLabel: label, style: [{ gap: spacing.xs, opacity: disabled ? 0.5 : 1 }, layoutStyle], children: [labelVisibility === 'visible' ? _jsx(Text, { variant: "label", accessibilityElementsHidden: true, importantForAccessibility: "no", children: label }) : null, layout === 'scroll'
                ? _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", contentContainerStyle: { gap: spacing.xxs }, children: items })
                : _jsx(View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }, children: items })] });
}
//# sourceMappingURL=color-picker.js.map