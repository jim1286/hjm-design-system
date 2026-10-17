/**
 * True inside ScreenLayout's footer. The footer already owns the bar chrome (top border, screen padding, safe area), so
 * BottomCTA placed there renders only its copy and actions; drawing its own bar too doubled the border, inset the
 * buttons twice and (Native) added a shadowed surface inside the footer (2026-10-17 screen review, common-screen-shell).
 */
export declare const ScreenFooterContext: import("react").Context<boolean>;
//# sourceMappingURL=screen-footer.d.ts.map