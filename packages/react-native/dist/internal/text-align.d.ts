/**
 * React Native text does not inherit `text-align` like CSS does. Containers whose Web counterpart sets
 * `text-align` (e.g. the AuthScreenLayout hero, `.hjm-auth-screen__hero { text-align: center }`) provide
 * it here so nested Text without an explicit `align` matches Web (2026-10-17 web/native comparison).
 */
export declare const InheritedTextAlignContext: import("react").Context<"left" | "right" | "auto" | "center" | "justify" | undefined>;
export declare const useInheritedTextAlign: () => "left" | "right" | "auto" | "center" | "justify" | undefined;
//# sourceMappingURL=text-align.d.ts.map