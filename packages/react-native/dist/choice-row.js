import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { resolveChoiceRow } from "@hjmds/design-contracts/choice-row";
import { ListRow } from "./data-display.js";
import { RadioGroup } from "./inputs.js";
import { Sheet } from "./overlays.js";
export function ChoiceRow(props) {
    const { title, items, value, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, accessibilityHint, density, disabled = false, loading = false } = props;
    const { valueLabel } = resolveChoiceRow({ title, items, value, ...(placeholder === undefined ? {} : { placeholder }) });
    if (!closeLabel.trim() || (errorLabel !== undefined && !errorLabel.trim()))
        throw new TypeError("ChoiceRow text must not be empty");
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);
    const choose = (next) => {
        if (next === null || next === value || pending)
            return;
        setFailed(false);
        const result = props.onValueChange(next);
        if (!result) {
            setOpen(false);
            return;
        }
        setPending(true);
        result.then(() => { setPending(false); setOpen(false); }, () => { setPending(false); setFailed(true); });
    };
    return _jsxs(_Fragment, { children: [_jsx(ListRow, { title: title, description: valueLabel, ...(leading === undefined ? {} : { leading }), ...(trailing === undefined ? {} : { trailing }), ...(density === undefined ? {} : { density }), disabled: disabled, loading: loading, accessibilityState: { expanded: open }, ...(accessibilityHint === undefined ? {} : { accessibilityHint }), onPress: () => { setFailed(false); setOpen(true); } }), _jsx(Sheet, { open: open, onOpenChange: (next) => { if (!pending)
                    setOpen(next); }, title: sheetTitle ?? title, closeLabel: closeLabel, busy: pending, 
                // Locale and region lists outgrow the screen; the header stays fixed while the choices scroll.
                scrollable: true, ...(sheetDescription === undefined ? {} : { description: sheetDescription }), children: _jsx(RadioGroup, { accessibilityLabel: sheetTitle ?? title, orientation: "vertical", value: value, items: items, disabled: pending, ...(failed && errorLabel !== undefined ? { error: errorLabel } : {}), onValueChange: choose }) })] });
}
//# sourceMappingURL=choice-row.js.map