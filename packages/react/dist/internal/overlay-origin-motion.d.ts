import { type TransitionRect } from '@hjmds/design-contracts/content-transition';
/** Keep one real modal subtree through exit; cancellation must never settle a reopened cycle. */
export declare function useOverlayOriginMotion(open: boolean, origin: TransitionRect | undefined, reduced: boolean | undefined): {
    visible: boolean;
    setNode: import("react").Dispatch<import("react").SetStateAction<HTMLDivElement | null>>;
};
//# sourceMappingURL=overlay-origin-motion.d.ts.map