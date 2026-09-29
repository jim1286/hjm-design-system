import { type LiquidToastAnchor } from "@hjmds/design-contracts/components/toast";
import type { ToastPresentationAdapter } from "./internal/toast-presentation.js";
export type LiquidToastOptions = Readonly<{
    anchor?: LiquidToastAnchor;
}>;
/** Optional entry: requires Skia 2.6, Reanimated 4.5 and Worklets 0.10 in the host. */
export declare function createLiquidToastPresentation(options?: LiquidToastOptions): ToastPresentationAdapter;
//# sourceMappingURL=toast-liquid.d.ts.map