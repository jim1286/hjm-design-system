/** Candidate composition contract; file access, transfer and receipt verification stay with the host. */
export type DocumentPreviewState = Readonly<{
    status: "none" | "loading" | "ready";
}> | Readonly<{
    status: "error";
    message: string;
    retryable: boolean;
}>;
export type DocumentSaveState = Readonly<{
    status: "idle" | "pending" | "started" | "saved" | "cancelled";
}> | Readonly<{
    status: "error";
    message: string;
    retryable: boolean;
}>;
export type DocumentResourceDescriptor = Readonly<{
    /** Include a revision when reusing a resource id for different file contents. */
    id: string;
    name: string;
    formatLabel?: string;
    sizeLabel?: string;
    description?: string;
    disabled?: boolean;
    preview: DocumentPreviewState;
    save: DocumentSaveState;
}>;
export type DocumentResourceLabels = Readonly<{
    preview: string;
    previewLoading: string;
    previewUnavailable: string;
    retryPreview: string;
    save: string;
    saving: string;
    started: string;
    saved: string;
    cancelled: string;
    retrySave: string;
}>;
export type DocumentResourceControls = Readonly<{
    descriptor: DocumentResourceDescriptor;
    labels: DocumentResourceLabels;
    onPreview?: () => void;
    onRetryPreview?: () => void;
    onSave: () => void;
    onRetrySave?: () => void;
}>;
/** Controlled UI only: hosts connect the existing action session to their verified results. */
export declare function resolveDocumentResourceControls(props: DocumentResourceControls): Readonly<{
    id: string;
    name: string;
    metadata: readonly string[];
    description: string | undefined;
    disabled: boolean;
    preview: Readonly<{
        status: "none" | "loading" | "ready";
    } | {
        status: "error";
        message: string;
        retryable: boolean;
    }>;
    save: Readonly<{
        status: "idle" | "pending" | "started" | "saved" | "cancelled";
    } | {
        status: "error";
        message: string;
        retryable: boolean;
    }>;
    canPreview: boolean;
    canRetryPreview: boolean;
    canSave: boolean;
    canRetrySave: boolean;
    saved: boolean;
}>;
export declare function resolveDocumentResource(descriptor: DocumentResourceDescriptor): Readonly<{
    id: string;
    name: string;
    metadata: readonly string[];
    description: string | undefined;
    disabled: boolean;
    preview: Readonly<{
        status: "none" | "loading" | "ready";
    } | {
        status: "error";
        message: string;
        retryable: boolean;
    }>;
    save: Readonly<{
        status: "idle" | "pending" | "started" | "saved" | "cancelled";
    } | {
        status: "error";
        message: string;
        retryable: boolean;
    }>;
    canPreview: boolean;
    canRetryPreview: boolean;
    canSave: boolean;
    canRetrySave: boolean;
    saved: boolean;
}>;
//# sourceMappingURL=document-resource.d.ts.map