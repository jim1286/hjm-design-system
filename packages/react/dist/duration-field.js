import { jsx as _jsx } from "react/jsx-runtime";
import { changeDurationUnit, resolveDuration } from "@hjmds/design-contracts/duration-field";
import { NumberField } from "./number-field.js";
import { FieldGroup } from "./field-group.js";
const units = ["hours", "minutes", "seconds"];
/** Units and limits remain in seconds; FieldGroup owns grouping and edit lifetime. */
export function DurationField({ value, onValueChange, labels, min = 0, max, disabled = false, className, layoutStyle }) {
    const parts = resolveDuration(value, { min, max });
    return _jsx(FieldGroup, { layout: "inline", ...(className === undefined ? {} : { className }), ...(layoutStyle === undefined ? {} : { layoutStyle: layoutStyle }), descriptor: { label: labels.label, disabled,
            fields: units.map(unit => ({ id: unit, label: labels[unit], disabled: unit === "hours" && max < 3600 })) }, renderField: ({ id, controlProps, guardChange }) => {
            const unit = units.find(unit => unit === id);
            if (!unit)
                return null;
            return _jsx(NumberField, { ...controlProps, min: 0, max: unit === "hours" ? Math.max(1, Math.floor(max / 3600)) : 59, value: parts[unit], step: 1, incrementLabel: labels.increment(unit), decrementLabel: labels.decrement(unit), onValueChange: guardChange((next) => onValueChange(changeDurationUnit(value, unit, next, { min, max }))) });
        } });
}
//# sourceMappingURL=duration-field.js.map