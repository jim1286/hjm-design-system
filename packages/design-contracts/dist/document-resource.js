/** Controlled UI only: hosts connect the existing action session to their verified results. */
export function resolveDocumentResourceControls(props) {
    const resource = resolveDocumentResource(props.descriptor);
    for (const key of ["preview", "previewLoading", "previewUnavailable", "retryPreview", "save", "saving", "started", "saved", "cancelled", "retrySave"]) {
        text(props.labels[key], `labels.${key}`);
    }
    if (typeof props.onSave !== "function")
        throw new TypeError("Document resource requires onSave");
    for (const key of ["onPreview", "onRetryPreview", "onRetrySave"]) {
        if (props[key] !== undefined && typeof props[key] !== "function")
            throw new TypeError(`Document resource ${key} must be a function`);
    }
    if (resource.preview.status === "error" && resource.preview.retryable && !props.onRetryPreview)
        throw new TypeError("Retryable preview requires onRetryPreview");
    if (resource.save.status === "error" && resource.save.retryable && !props.onRetrySave)
        throw new TypeError("Retryable save requires onRetrySave");
    return resource;
}
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
    for (const key of ["disabled", "saveDisabled"]) {
        if (descriptor[key] !== undefined && typeof descriptor[key] !== "boolean") {
            throw new TypeError(`Document resource ${key} must be boolean`);
        }
    }
    state(descriptor.preview, ["none", "loading", "ready", "error"], "preview");
    state(descriptor.save, ["idle", "pending", "started", "saved", "cancelled", "error"], "save");
    const disabled = descriptor.disabled ?? false;
    // Utilverse requires viewing the output before accepting export; whole-card disabling
    // would prevent that review. The host owns the requirement, not a fake pending state.
    const saveDisabled = disabled || descriptor.saveDisabled === true;
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
        saveDisabled,
        preview,
        save,
        canPreview: !disabled && preview.status === "ready",
        canRetryPreview: !disabled && preview.status === "error" && preview.retryable,
        // Keep failures on the explicit retry path. A second ordinary save must not
        // bypass a host's retryable=false policy after an ambiguous OS response.
        canSave: !saveDisabled && save.status !== "pending" && save.status !== "error",
        canRetrySave: !saveDisabled && save.status === "error" && save.retryable,
        // Browser anchor activation proves initiation, not file-system completion.
        saved: save.status === "saved",
    });
}
//# sourceMappingURL=document-resource.js.map