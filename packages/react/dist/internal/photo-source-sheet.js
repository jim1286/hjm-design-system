"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListRow } from "../display.js";
import { Stack } from "../layout.js";
import { Sheet } from "../overlays.js";
import { PhotoSourceIcon } from "./photo-source-icon.js";
export function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled = false, cameraAvailable = true }) {
    // File-input click must stay in the user's activation stack. Deferring until the
    // sheet animation ends can cause browsers to reject camera/album selection.
    const select = (source) => { if (disabled)
        return; onOpenChange(false); onSelect(source); };
    // Same peer list actions as Native, without changing the browser activation stack.
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: labels.title, closeLabel: labels.cancel, children: _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { title: labels.library, leading: _jsx(PhotoSourceIcon, { source: "library" }), disabled: disabled, onClick: () => select("library") }), cameraAvailable ? _jsx(ListRow, { title: labels.camera, leading: _jsx(PhotoSourceIcon, { source: "camera" }), disabled: disabled, onClick: () => select("camera") }) : null] }) });
}
//# sourceMappingURL=photo-source-sheet.js.map