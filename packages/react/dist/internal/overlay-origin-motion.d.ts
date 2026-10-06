import { type TransitionRect } from '@hjmds/design-contracts/content-transition';
import { dialogRecipe } from '@hjmds/design-contracts/recipes';
type OriginMotionOptions = Readonly<{
    ready?: boolean;
    transition?: typeof dialogRecipe.transition;
}>;
/** Keep one real overlay subtree through exit; cancellation must never settle a reopened cycle. */
export declare function useOverlayOriginMotion(open: boolean, origin: TransitionRect | undefined, reduced: boolean | undefined, { ready, transition }?: OriginMotionOptions): {
    visible: boolean;
    setNode: import("react").Dispatch<import("react").SetStateAction<HTMLDivElement | null>>;
};
export {};
//# sourceMappingURL=overlay-origin-motion.d.ts.map