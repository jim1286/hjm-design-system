/**
 * Web-page HTTP status vocabulary (403/404/500) does not belong in a
 * platform-neutral contract. Products/adapters translate those into
 * `failure` with their own localized copy.
 */
export type ResultStatus = "success" | "failure" | "info";
export declare const resultDefaults: {
    readonly status: "info";
};
export type ResultActionDescriptor = Readonly<{
    label: string;
    accessibilityLabel?: string;
    onAction(): void;
}>;
/**
 * A flow terminus screen (success, failure, 404-equivalent). Unlike
 * `EmptyState`, which describes a place that can still be filled, Result
 * means this flow ends here — there is no pending content to wait for.
 *
 * `actions` holds at most one primary and one optional secondary action;
 * the first entry is the primary. A third action is refused, not silently
 * dropped, so a screen author notices instead of shipping a truncated row.
 */
export type ResultDescriptor = Readonly<{
    status: ResultStatus;
    title: string;
    description?: string;
    actions?: readonly ResultActionDescriptor[];
}>;
export type ResolvedResultActionDescriptor = Readonly<{
    label: string;
    accessibilityLabel: string;
    onAction(): void;
}>;
export type ResolvedResultDescriptor = Readonly<{
    status: ResultStatus;
    title: string;
    description: string | null;
    primaryAction: ResolvedResultActionDescriptor | null;
    secondaryAction: ResolvedResultActionDescriptor | null;
}>;
export declare function validateResultAction(action: ResultActionDescriptor, field: string): void;
export declare function validateResultDescriptor(descriptor: ResultDescriptor): void;
export declare function resolveResultDescriptor(descriptor: ResultDescriptor): ResolvedResultDescriptor;
export declare const resultRecipe: {
    readonly slots: readonly ["root", "icon", "title", "description", "primaryAction", "secondaryAction"];
    readonly defaults: {
        readonly status: "info";
    };
    readonly tones: {
        readonly success: {
            readonly icon: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
        };
        readonly failure: {
            readonly icon: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly info: {
            readonly icon: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
        };
    };
    readonly iconSize: "xl";
    readonly paddingVertical: 40;
    readonly paddingHorizontal: 24;
    readonly gap: 12;
    readonly title: {
        readonly textVariant: "titleLarge";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly fontWeight: "700";
    };
    readonly description: {
        readonly textVariant: "body";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly actionsGap: 12;
};
//# sourceMappingURL=result.d.ts.map