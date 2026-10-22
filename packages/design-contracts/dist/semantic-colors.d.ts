/**
 * Stable role aliases above the legacy ThemeColors key set. New recipes should
 * prefer these roles so the underlying theme shape can evolve independently.
 */
export declare const semanticColors: {
    readonly canvas: Readonly<{
        source: "theme";
        key: "bg";
        alpha?: number;
    }>;
    readonly surface: {
        readonly default: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly sunken: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly raised: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly brand: Readonly<{
            source: "theme";
            key: "surfaceAccent";
            alpha?: number;
        }>;
        readonly statusNeutral: Readonly<{
            source: "theme";
            key: "neutralFill";
            alpha?: number;
        }>;
        readonly statusStrong: Readonly<{
            source: "theme";
            key: "strongFill";
            alpha?: number;
        }>;
        /**
         * Loading placeholder fill (Skeleton, ListRow `loading`). A translucent text tint instead of an opaque
         * neutral: it darkens/lightens whatever it sits on, so it stays visible on canvas, Card surfaces and
         * profile palettes whose `surfaceAlt` is as light as `bg` (2026-10-17 Skeleton review, skeleton.md 근거).
         */
        readonly placeholder: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    readonly selection: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceSelected";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
    };
    readonly content: {
        readonly primary: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly body: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly secondary: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly tertiary: Readonly<{
            source: "theme";
            key: "textSub";
            alpha?: number;
        }>;
        readonly decorative: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly inverse: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly statusInverse: Readonly<{
            source: "theme";
            key: "onStatusFill";
            alpha?: number;
        }>;
    };
    readonly border: {
        readonly subtle: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly default: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        /** Resting outline of an interactive control. */
        readonly control: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
        readonly strong: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly focus: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly action: {
        readonly brand: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly neutral: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
        };
        readonly danger: {
            readonly background: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
        };
    };
    readonly feedback: {
        readonly info: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
        };
        readonly success: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
        };
        readonly warning: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
        };
        readonly attention: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
        };
        readonly danger: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly interaction: {
        readonly hover: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly focus: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly pressed: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly selected: Readonly<{
            source: "theme";
            key: "surfaceSelected";
            alpha?: number;
        }>;
        /**
         * Lower edge of a raised object, composited over its own fill so one shade
         * darkens any brand color (BottomNavigation raised tile, Spint 2026-10-13).
         */
        readonly depth: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
};
//# sourceMappingURL=semantic-colors.d.ts.map