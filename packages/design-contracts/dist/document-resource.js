function text(value, field) {
    if (typeof value !== "string" || !value.trim())
        throw new TypeError(`Document resource ${field} must be nonempty text`);
}
function state(value, states, field) {
    if (!value || typeof value !== "object" || !("status" in value) || !states.includes(value.status)) {
        throw new TypeError(`Document resource ${field} has an unsupported status`);
    }
    if (value.status === "error") {
        const error = value;
        text(error.message, `${field} error`);
        // An uncertain native save can have committed. Retry permission is explicit,
        // just like action-session; an error alone never authorizes another write.
        if (typeof error.retryable !== "boolean")
            throw new TypeError(`Document resource ${field} retryable must be boolean`);
    }
}
export function resolveDocumentResource(descriptor) {
    text(descriptor.id, "id");
    text(descriptor.name, "name");
    for (const key of ["formatLabel", "sizeLabel", "description"]) {
        if (descriptor[key] !== undefined)
            text(descriptor[key], key);
    }
    if (descriptor.disabled !== undefined && typeof descriptor.disabled !== "boolean") {
        throw new TypeError("Document resource disabled must be boolean");
    }
    state(descriptor.preview, ["none", "loading", "ready", "error"], "preview");
    state(descriptor.save, ["idle", "pending", "started", "saved", "cancelled", "error"], "save");
    const disabled = descriptor.disabled ?? false;
    const preview = Object.freeze({ ...descriptor.preview });
    const save = Object.freeze({ ...descriptor.save });
    return Object.freeze({
        id: descriptor.id,
        name: descriptor.name,
        // Preserve product formatting and order; neither URL extensions nor inferred
        // byte counts are reliable metadata for remote/signed/local resources.
        metadata: Object.freeze([descriptor.formatLabel, descriptor.sizeLabel].filter((value) => value !== undefined)),
        description: descriptor.description,
        disabled,
        preview,
        save,
        canPreview: !disabled && preview.status === "ready",
        canRetryPreview: !disabled && preview.status === "error" && preview.retryable,
        // Keep failures on the explicit retry path. A second ordinary save must not
        // bypass a host's retryable=false policy after an ambiguous OS response.
        canSave: !disabled && save.status !== "pending" && save.status !== "error",
        canRetrySave: !disabled && save.status === "error" && save.retryable,
        // Browser anchor activation proves initiation, not file-system completion.
        saved: save.status === "saved",
    });
}
//# sourceMappingURL=document-resource.js.map