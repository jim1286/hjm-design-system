import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { resolveChoiceRow } from "@hjmds/design-contracts/choice-row";
import { ListRow } from "./display.js";
import { Sheet } from "./overlays.js";
import { RadioGroup } from "./selection.js";
export function ChoiceRow({ title, items, value, onValueChange, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, disabled = false, loading = false }) {
    const { valueLabel } = resolveChoiceRow({ title, items, value, ...(placeholder === undefined ? {} : { placeholder }) });
    if (!closeLabel.trim() || !errorLabel.trim())
        throw new TypeError("ChoiceRow text must not be empty");
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);
    const choose = (raw) => {
        // RadioGroup only offers the values passed in `items`, so the string is one of `Value`.
        const next = raw;
        if (next === value || pending)
            return;
        setFailed(false);
        const result = onValueChange(next);
        if (!result) {
            setOpen(false);
            return;
        }
        setPending(true);
        result.then(() => { setPending(false); setOpen(false); }, () => { setPending(false); setFailed(true); });
    };
    return _jsxs(_Fragment, { children: [_jsx(ListRow, { title: title, description: valueLabel, ...(leading === undefined ? {} : { leading }), ...(trailing === undefined ? {} : { trailing }), disabled: disabled, loading: loading, "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => { setFailed(false); setOpen(true); } }), _jsx(Sheet, { open: open, onOpenChange: (next) => { if (!pending)
                    setOpen(next); }, title: sheetTitle ?? title, closeLabel: closeLabel, busy: pending, ...(sheetDescription === undefined ? {} : { description: sheetDescription }), children: _jsx(RadioGroup, { accessibilityLabel: sheetTitle ?? title, orientation: "vertical", value: value, items: items, disabled: pending, ...(failed ? { error: errorLabel } : {}), onValueChange: choose }) })] });
}
//# sourceMappingURL=choice-row.js.map