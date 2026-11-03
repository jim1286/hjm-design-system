import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { ListRow } from "../data-display.js";
import { Sheet } from "../overlays.js";
import { Stack } from "../primitives.js";
import { PhotoSourceIcon } from "./photo-source-icon.js";
export function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled = false, cameraAvailable = true }) {
    const queued = useRef(null);
    useEffect(() => () => { queued.current = null; }, []);
    // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
    // dismissal completion (including Android fallback), so a timer is not a safe substitute.
    const select = (source) => { if (disabled || queued.current)
        return; queued.current = source; onOpenChange(false); };
    const complete = () => { const source = queued.current; queued.current = null; if (source && !disabled && (source !== "camera" || cameraAvailable))
        onSelect(source); };
    // A later close action is cancellation, even if the controlled owner previously
    // deferred closing after source selection. Do not launch that abandoned picker.
    const dismiss = (next) => { if (!next)
        queued.current = null; onOpenChange(next); };
    // Source choices are peer list actions; the shared row owns touch geometry and label alignment.
    return _jsx(Sheet, { open: open, onOpenChange: dismiss, title: labels.title, closeLabel: labels.cancel, onDismissComplete: complete, children: _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { title: labels.library, leading: _jsx(PhotoSourceIcon, { source: "library" }), disabled: disabled, onPress: () => select("library") }), cameraAvailable ? _jsx(ListRow, { title: labels.camera, leading: _jsx(PhotoSourceIcon, { source: "camera" }), disabled: disabled, onPress: () => select("camera") }) : null] }) });
}
//# sourceMappingURL=photo-source-sheet.js.map