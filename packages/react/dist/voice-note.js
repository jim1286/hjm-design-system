import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveVoiceNote } from "@hjmds/design-contracts/voice-note";
import { Asset } from "./asset.js";
import { Button } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Surface, Text } from "./layout.js";
/** Audio engine, network, file permission and playback lifecycle remain host-owned. */
export function VoiceNote({ descriptor, labels, formatTime, artwork, onPlayingChange, onSeek, onRetry }) {
    const media = resolveVoiceNote(descriptor);
    const error = media.state === "error";
    return _jsx(Surface, { padding: "lg", children: _jsxs(Stack, { gap: "md", children: [_jsxs(Stack, { axis: "inline", gap: "md", children: [artwork ? _jsx(Asset, { descriptor: { kind: "image", decorative: true, shape: "circle" }, children: artwork }) : null, _jsx(Text, { emphasis: "strong", children: media.title })] }), _jsx(Slider, { label: labels.seek, min: 0, max: media.duration || 1, step: 0.1, value: media.position, disabled: !media.canSeek, onValueChange: onSeek, getValueText: formatTime }), _jsxs(Text, { tone: "muted", children: [formatTime(media.position), media.duration === null ? "" : ` / ${formatTime(media.duration)}`] }), error ? _jsx(Text, { role: "alert", children: labels.error }) : null, _jsxs(Stack, { axis: "inline", gap: "sm", children: [_jsx(Button, { disabled: !media.canPlay, loading: media.state === "loading", onClick: () => onPlayingChange(media.state !== "playing"), children: media.state === "loading" ? labels.loading : media.state === "playing" ? labels.pause : labels.play }), error && onRetry ? _jsx(Button, { disabled: media.disabled ?? false, onClick: onRetry, children: labels.retry }) : null] })] }) });
}
//# sourceMappingURL=voice-note.js.map