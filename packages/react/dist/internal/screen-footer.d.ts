/**
 * Set inside a padded ScreenLayout or Sheet footer. The parent owns the bar chrome and safe area, so
 * BottomCTA placed there renders only its copy and actions; drawing its own bar too doubled the border, inset the
 * buttons twice and (Native) added a shadowed surface inside the footer (2026-10-17 screen review, common-screen-shell).
 */
export declare const ScreenFooterContext: import("react").Context<Readonly<{
    bottomPadding: string;
}> | null>;
//# sourceMappingURL=screen-footer.d.ts.map