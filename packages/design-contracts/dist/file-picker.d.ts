export type FilePickerMode = "single" | "multiple";
/**
 * MIME pattern ("image/png", "image" + wildcard subtype, or wildcard/wildcard)
 * or extension (".pdf"). Extensions exist because native pickers do not
 * always resolve a MIME type.
 */
export type FilePickerAcceptPattern = string;
export type FilePickerDescriptor = Readonly<{
    mode?: FilePickerMode;
    accept?: readonly FilePickerAcceptPattern[];
    maxSizeBytes?: number;
    /** Only meaningful when `mode` is `"multiple"` — single mode is always capped at one. */
    maxCount?: number;
}>;
export type ResolvedFilePickerDescriptor = Readonly<{
    mode: FilePickerMode;
    accept?: readonly FilePickerAcceptPattern[];
    maxSizeBytes?: number;
    maxCount?: number;
}>;
export declare const filePickerDefaults: {
    readonly mode: "single";
};
/** A file the platform picker or drop target produced, before FilePicker judges it. */
export type FilePickerCandidate = Readonly<{
    id: string;
    name: string;
    /** `""` when the platform could not resolve a MIME type. */
    mimeType: string;
    sizeBytes: number;
}>;
export type FilePickerRejectionReason = "unsupported-type" | "too-large" | "count-exceeded";
export type FilePickerRejection = Readonly<{
    file: FilePickerCandidate;
    reason: "unsupported-type";
    accept: readonly FilePickerAcceptPattern[];
}> | Readonly<{
    file: FilePickerCandidate;
    reason: "too-large";
    maxSizeBytes: number;
}> | Readonly<{
    file: FilePickerCandidate;
    reason: "count-exceeded";
    maxCount: number;
}>;
/**
 * `accepted` and `rejected` are reported together on purpose: a rejection
 * never has to be inferred by diffing two lists, and the rest of the batch
 * staying selected is visible in the same result (identity.md's "what broke
 * + what stayed fine").
 */
export type FilePickerSelectionResult = Readonly<{
    accepted: readonly FilePickerCandidate[];
    rejected: readonly FilePickerRejection[];
}>;
export declare function validateFilePickerDescriptor(descriptor: FilePickerDescriptor): void;
export declare function resolveFilePickerDescriptor(descriptor: FilePickerDescriptor): ResolvedFilePickerDescriptor;
export declare function validateFilePickerCandidate(candidate: FilePickerCandidate): void;
/**
 * `undefined`/empty `accept` means unrestricted. Exported so a Web renderer's
 * live drag-over preview and the post-drop judgment share one rule.
 */
export declare function matchesFilePickerAccept(candidate: FilePickerCandidate, accept: readonly FilePickerAcceptPattern[] | undefined): boolean;
/**
 * Judges one selection batch against the descriptor. `existingCount` is a
 * read-only input — like Select's `selectedItem` — for products that let
 * users add files across repeated picks; FilePicker never accumulates a
 * selection list itself.
 */
export declare function resolveFilePickerSelection(candidates: readonly FilePickerCandidate[], descriptor: FilePickerDescriptor, existingCount?: number): FilePickerSelectionResult;
export type FilePickerTriggerPlatform = "web" | "native";
export type FilePickerTrigger = "button" | "dropzone";
/**
 * Drag-and-drop is a Web-only enhancement. `validateFilePickerTriggers`
 * enforces the roadmap's adaptive gate: Native never gets a dropzone, and no
 * platform may ship a dropzone without an always-reachable button — the same
 * "automatic mode keeps a manual fallback" principle as LoadMore
 * (`src/load-more.ts`).
 */
export declare const filePickerTriggerDefaults: {
    readonly web: readonly ["button", "dropzone"];
    readonly native: readonly ["button"];
};
export declare function validateFilePickerTriggers(platform: FilePickerTriggerPlatform, triggers: readonly FilePickerTrigger[]): void;
export type FilePickerDensity = "compact" | "regular";
export declare const filePickerRecipe: {
    readonly slots: readonly ["root", "trigger", "dropzone", "hint", "error"];
    readonly defaults: {
        readonly density: "regular";
    };
    readonly trigger: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
        readonly radius: "md";
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly fontWeight: "700";
    };
    readonly dropzone: {
        readonly borderStyle: "dashed";
        readonly borderWidth: 1;
        readonly borderColor: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly activeBorderColor: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly activeBackground: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly radius: "lg";
        readonly padding: 24;
    };
    readonly hint: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly error: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly disabledOpacity: 0.5;
    };
};
/**
 * No `open`/dismiss axis: the platform picker sheet is transient OS chrome
 * FilePicker does not model, unlike Select/Sheet which own their surface.
 */
export declare const filePickerBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["descriptor", "existingCount"];
    readonly events: readonly ["onSelect"];
    readonly configuration: {
        readonly mode: readonly ["single", "multiple"];
    };
    readonly defaults: {
        readonly mode: "single";
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed", "dragged"];
    };
    readonly web: {
        readonly roles: readonly ["button"];
        readonly keyboard: readonly ["Tab", "Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["disabled"];
        readonly actions: readonly ["activate"];
    };
    readonly scenarios: readonly ["selecting-files-never-mutates-already-accepted-items", "rejected-files-report-a-reason-without-blocking-the-rest-of-the-batch", "type-and-size-are-judged-at-selection-time-not-upload-time", "count-cap-accounts-for-already-selected-items-across-repeated-picks", "single-mode-behaves-as-an-implicit-one-file-count-cap", "web-dropzone-is-always-paired-with-a-reachable-button-trigger", "native-never-exposes-a-dropzone-trigger", "rejection-is-announced-without-relying-on-color-alone"];
};
//# sourceMappingURL=file-picker.d.ts.map