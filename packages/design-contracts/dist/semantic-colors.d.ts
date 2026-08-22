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
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
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
            key: "primary";
            alpha?: number;
        }>;
    };
};
//# sourceMappingURL=semantic-colors.d.ts.map