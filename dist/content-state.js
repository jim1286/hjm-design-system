function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`ContentState ${field} must not be empty`);
    }
}
function assertScope(scope) {
    if (scope !== "screen" && scope !== "region") {
        throw new TypeError(`Unsupported ContentState scope: ${String(scope)}`);
    }
}
function assertAction(action, field) {
    assertCopy(action.label, `${field}.label`);
    if (action.accessibilityLabel !== undefined) {
        assertCopy(action.accessibilityLabel, `${field}.accessibilityLabel`);
    }
    if (typeof action.onAction !== "function") {
        throw new TypeError(`ContentState ${field}.onAction must be a function`);
    }
}
/**
 * `loading` descriptors carry no `title`/`description`/`action` by design —
 * a validator that reused one blanket "title required" check across every
 * status would reject a perfectly valid loading block. Branch on `status`
 * before asserting copy, and never assert fields the branch doesn't declare.
 */
export function validateContentStateDescriptor(descriptor) {
    assertScope(descriptor.scope);
    const status = descriptor.status;
    if (status !== "loading" && status !== "empty" && status !== "error") {
        throw new TypeError(`Unsupported ContentState status: ${String(status)}`);
    }
    if (descriptor.status === "loading") {
        assertCopy(descriptor.loadingLabel, "loadingLabel");
        return;
    }
    assertCopy(descriptor.title, "title");
    if (descriptor.description !== undefined) {
        assertCopy(descriptor.description, "description");
    }
    if (descriptor.action)
        assertAction(descriptor.action, "action");
}
export function resolveContentStateActionEmphasis(scope) {
    assertScope(scope);
    return scope === "screen" ? "sole" : "optional";
}
export function resolveContentStateAnnouncement(status, scope) {
    assertScope(scope);
    if (status === "loading") {
        return {
            web: { role: "status", live: "polite" },
            native: {
                accessibilityLiveRegion: "polite",
                accessibilityRole: "progressbar",
                moveAccessibilityFocus: false,
            },
        };
    }
    if (status === "empty") {
        return {
            web: { role: "status", live: "polite" },
            native: {
                accessibilityLiveRegion: "polite",
                accessibilityRole: "text",
                moveAccessibilityFocus: false,
            },
        };
    }
    if (status === "error") {
        return {
            web: { role: "alert", live: "assertive" },
            native: {
                accessibilityLiveRegion: "assertive",
                accessibilityRole: "alert",
                moveAccessibilityFocus: scope === "screen",
            },
        };
    }
    throw new TypeError(`Unsupported ContentState status: ${String(status)}`);
}
export function resolveContentStateDescriptor(descriptor) {
    validateContentStateDescriptor(descriptor);
    const { web, native } = resolveContentStateAnnouncement(descriptor.status, descriptor.scope);
    if (descriptor.status === "loading") {
        return {
            status: "loading",
            scope: descriptor.scope,
            title: null,
            description: null,
            loadingLabel: descriptor.loadingLabel,
            action: null,
            web,
            native,
        };
    }
    const emphasis = resolveContentStateActionEmphasis(descriptor.scope);
    const action = descriptor.action
        ? {
            label: descriptor.action.label,
            accessibilityLabel: descriptor.action.accessibilityLabel ?? descriptor.action.label,
            onAction: descriptor.action.onAction,
            emphasis,
        }
        : null;
    return {
        status: descriptor.status,
        scope: descriptor.scope,
        title: descriptor.title,
        description: descriptor.description ?? null,
        loadingLabel: null,
        action,
        web,
        native,
    };
}
//# sourceMappingURL=content-state.js.map