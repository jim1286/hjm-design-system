/**
 * Timeline is a record of what already happened, not a position in a flow —
 * that is Steps' job (see docs/steps.md and the boundary note in
 * docs/timeline.md). Because there is no cursor, Timeline never derives a
 * status from position: every item is simply "happened", and the connector
 * between items carries no reached/unreached meaning. Ant Design's
 * alternating left/right layout is intentionally not reproduced — it is a
 * Web-only decoration with no equivalent in a single-direction native list;
 * see docs/timeline.md for the rationale.
 */
export type TimelineItemTone = "neutral" | "info" | "success" | "attention";
export type TimelineItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    /** Product-formatted "when" copy, e.g. "3회 초" or "2024-01-15". Timeline never formats a clock, inning, or date itself. */
    timestamp?: string;
    /** Product-formatted supplementary detail, e.g. "안타로 1루 진출". */
    description?: string;
    tone?: TimelineItemTone;
}>;
export type TimelineDescriptor<Id extends string = string> = Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
}>;
export declare const timelineDefaults: {
    readonly itemTone: "neutral";
};
export type TimelineAccessibleNameInfo = Readonly<{
    position: number;
    total: number;
    label: string;
}>;
/**
 * Products own the exact phrase order and counter-word grammar, same reason
 * Steps does not assemble its own accessible name (see docs/steps.md).
 */
export type ComposeTimelineAccessibleName = (info: TimelineAccessibleNameInfo) => string;
export type ResolvedTimelineItemDescriptor<Id extends string = string> = Omit<TimelineItemDescriptor<Id>, "tone"> & Readonly<{
    tone: TimelineItemTone;
    /** 1-indexed so position and label both preserve reading order for renderers. */
    position: number;
    total: number;
    /** Order + label, for platforms without built-in list-position semantics. */
    accessibleName: string;
}>;
export type ResolveTimelineOptions = Readonly<{
    composeAccessibleName: ComposeTimelineAccessibleName;
}>;
export declare function validateTimelineItemDescriptor<Id extends string>(item: TimelineItemDescriptor<Id>): void;
export declare function validateTimelineDescriptor<Id extends string>(descriptor: TimelineDescriptor<Id>): void;
/**
 * Attaches order-preserving accessible names to an already-ordered item list.
 * Unlike Steps, no status is derived from position — every item already
 * happened, so this only adds order and the resolved tone default.
 */
export declare function resolveTimelineDescriptor<Id extends string>(descriptor: TimelineDescriptor<Id>, options: ResolveTimelineOptions): readonly ResolvedTimelineItemDescriptor<Id>[];
export declare const timelineRecipe: {
    readonly slots: readonly ["root", "item", "dot", "connector", "content", "timestamp", "label", "description"];
    readonly gap: 16;
    readonly dot: {
        readonly diameter: 10;
        readonly borderWidth: 1;
        readonly tones: {
            readonly neutral: {
                readonly border: null;
                readonly fill: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
            };
            readonly info: {
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly fill: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly fill: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly fill: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
        };
    };
    /**
     * A single tone, unlike stepsRecipe.connector's reached/unreached pair —
     * Timeline has no cursor, so no segment is "not yet reached".
     */
    readonly connector: {
        readonly width: 1;
        readonly tone: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    readonly timestamp: {
        readonly textVariant: "caption";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly label: {
        readonly textVariant: "body";
        readonly fontWeight: "600";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    readonly description: {
        readonly textVariant: "body";
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
    };
};
//# sourceMappingURL=timeline.d.ts.map