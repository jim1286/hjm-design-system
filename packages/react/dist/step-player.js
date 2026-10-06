import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Steps } from "./steps.js";
import { Progress } from "./feedback.js";
import { Button } from "./actions.js";
import { Stack } from "./layout.js";
/** Controlled playback chrome: Steps owns the cursor and Progress owns range semantics. */
export function StepPlayer({ descriptor, statusLabels, composeAccessibleName, progress, playing, disabled = false, labels, onPlayingChange, onReplay, children, layoutStyle }) {
    // No internal timer: walkthroughs, recordings and host processes have different clocks.
    if (!Number.isFinite(progress) || progress < 0 || progress > 1)
        throw new RangeError("StepPlayer progress must be between 0 and 1");
    for (const label of Object.values(labels))
        if (!label.trim())
            throw new TypeError("StepPlayer requires localized control labels");
    return _jsxs(Stack, { gap: "lg", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [_jsx(Steps, { descriptor: descriptor, statusLabels: statusLabels, composeAccessibleName: composeAccessibleName }), children, _jsx(Progress, { label: labels.progress, value: progress, max: 1 }), _jsxs(Stack, { axis: "inline", gap: "sm", children: [_jsx(Button, { disabled: disabled, onClick: () => onPlayingChange(!playing), children: playing ? labels.pause : labels.play }), _jsx(Button, { disabled: disabled, tone: "ghost", onClick: onReplay, children: labels.replay })] })] });
}
//# sourceMappingURL=step-player.js.map