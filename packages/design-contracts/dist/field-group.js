function requireText(value, name) {
    if (typeof value !== "string" || !value.trim())
        throw new TypeError(`Field group ${name} must be nonempty text`);
}
/** Late native events and retained callbacks must use the current committed group policy. */
export function createFieldGroupEditSession(fields) {
    let enabled = new Set(fields.filter(field => !field.disabled).map(field => field.id));
    return {
        update(next) {
            enabled = new Set(next.filter(field => !field.disabled).map(field => field.id));
        },
        guard(id, callback) {
            return (...args) => { if (enabled.has(id))
                callback(...args); };
        },
    };
}
function optionalText(value, name) {
    if (value !== undefined)
        requireText(value, name);
}
function optionalBoolean(value) {
    if (value !== undefined && typeof value !== "boolean")
        throw new TypeError("Field group disabled must be boolean");
}
export function resolveFieldGroup(descriptor) {
    requireText(descriptor.label, "label");
    optionalText(descriptor.description, "description");
    optionalBoolean(descriptor.disabled);
    if (!Array.isArray(descriptor.fields))
        throw new TypeError("Field group fields must be an array");
    const ids = new Set();
    for (const field of descriptor.fields) {
        requireText(field.id, "field id");
        requireText(field.label, "field label");
        optionalText(field.description, "field description");
        optionalText(field.error, "field error");
        optionalBoolean(field.disabled);
        if (ids.has(field.id))
            throw new TypeError("Field group field ids must be unique");
        ids.add(field.id);
    }
    if (descriptor.error !== undefined) {
        requireText(descriptor.error.message, "error");
        const affected = descriptor.error.fieldIds;
        // A typo or removed field must not silently lose its validation feedback.
        // Products update the visible error with their dynamic field list atomically.
        if (!Array.isArray(affected) || new Set(affected).size !== affected.length || affected.some(id => !ids.has(id))) {
            throw new TypeError("Field group error must reference distinct current field ids");
        }
    }
    const disabled = descriptor.disabled ?? false;
    return Object.freeze({
        label: descriptor.label,
        description: descriptor.description,
        error: descriptor.error?.message,
        disabled,
        fields: Object.freeze(descriptor.fields.map(field => {
            const groupError = descriptor.error?.fieldIds.includes(field.id) ? descriptor.error.message : undefined;
            const support = [];
            if (descriptor.description !== undefined)
                support.push({ scope: "group", kind: "description", text: descriptor.description });
            if (field.description !== undefined)
                support.push({ scope: "field", kind: "description", text: field.description });
            if (field.error !== undefined)
                support.push({ scope: "field", kind: "error", text: field.error });
            if (groupError !== undefined)
                support.push({ scope: "group", kind: "error", text: groupError });
            return Object.freeze({ id: field.id, label: field.label, groupLabel: descriptor.label,
                // Group unlock restores independently disabled members; it never enables them.
                disabled: disabled || (field.disabled ?? false), invalid: field.error !== undefined || groupError !== undefined,
                support: Object.freeze(support.map(message => Object.freeze(message))) });
        })),
    });
}
//# sourceMappingURL=field-group.js.map