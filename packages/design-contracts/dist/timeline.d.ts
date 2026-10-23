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
    /** Machine-readable date for the formatted timestamp; products retain the original instant. */
    dateTime?: string;
    /** Product-formatted supplementary detail, e.g. "안타로 1루 진출". */
    description?: string;
    tone?: TimelineItemTone;
    /** Passive emphasis for a notable record, not a progress cursor or selection. */
    emphasized?: boolean;
}>;
export type TimelineDescriptor<Id extends string = string> = Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    /**
     * Single selection of one record (2026-10-23): `undefined` keeps the passive record, `null` makes the list selectable
     * with nothing chosen yet. Selection is not a progress cursor — no status is derived from it. Diairy's journey log
     * rebuilt this with a `Button` tone toggle + `aria-pressed` per step (SELECTION forbids button-as-selection).
     */
    selectedId?: Id | null;
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
    /** True only for the record matching a selectable Timeline's `selectedId`. */
    selected: boolean;
}>;
export type ResolveTimelineOptions = Readonly<{
    composeAccessibleName: ComposeTimelineAccessibleName;
}>;
export declare function validateTimelineItemDescriptor<Id extends string>(item: TimelineItemDescriptor<Id>): void;
export declare function validateTimelineDescriptor<Id extends string>(descriptor: TimelineDescriptor<Id>): void;
/**
 * Selection is a pair: a controlled `selectedId` (null for none) and the change callback, or neither. A selectable
 * record is one target (Web option, Native selected button), so it cannot also host `renderActions` commands —
 * nested controls inside an option are not operable by assistive tech. Products that need a per-record command keep
 * the passive Timeline.
 */
export declare function validateTimelineSelection(selectedId: unknown, onSelectedIdChange: unknown, options?: Readonly<{
    hasActions: boolean;
}>): void;
/**
 * Keyboard target for a selectable Timeline (vertical listbox): ArrowDown/ArrowUp step one record, Home/End jump to
 * the ends, and the ends do not wrap — a history has a first and a last record. Selection follows focus, as in the
 * single-select listbox pattern, because choosing a record only changes what the product shows next to it.
 * Returns undefined for keys Timeline does not own. Reuses the shared collection navigation math.
 */
export declare function getTimelineSelectionTarget<Id extends string>(items: readonly TimelineItemDescriptor<Id>[], currentId: Id | null, key: string): Id | undefined;
/**
 * Attaches order-preserving accessible names to an already-ordered item list.
 * Unlike Steps, no status is derived from position — every item already
 * happened, so this only adds order and the resolved tone default.
 */
export declare function resolveTimelineDescriptor<Id extends string>(descriptor: TimelineDescriptor<Id>, options: ResolveTimelineOptions): readonly ResolvedTimelineItemDescriptor<Id>[];
export declare const timelineRecipe: {
    readonly slots: readonly ["root", "item", "dot", "connector", "content", "timestamp", "label", "description"];
    readonly gap: 20;
    readonly item: {
        readonly padding: 12;
        readonly emphasisBackground: Readonly<{
            source: "accent";
            key: "info";
            alpha?: number;
        }>;
        /**
         * Selected record (selectable Timeline): the neutral persistent-selection surface and ring shared with ListRow,
         * not brand fill (theme-palette.md 선택 상태 색상 기준). Selection outranks passive emphasis on the same record.
         */
        readonly selected: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceSelected";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
        };
    };
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
        readonly fontWeight: "500";
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