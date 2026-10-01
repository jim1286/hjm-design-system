import type { ReactNode } from "react";
import { type StepsProps } from "./steps.js";
export type StepPlayerProps = Readonly<{
    descriptor: StepsProps["descriptor"];
    statusLabels: StepsProps["statusLabels"];
    composeAccessibleName: StepsProps["composeAccessibleName"];
    /** Playback position is supplied by the host, never estimated from elapsed time. */
    progress: number;
    playing: boolean;
    disabled?: boolean;
    labels: Readonly<{
        play: string;
        pause: string;
        replay: string;
        progress: string;
    }>;
    onPlayingChange: (playing: boolean) => void;
    /** Host resets its cursor/progress and chooses whether replay starts immediately. */
    onReplay: () => void;
    children?: ReactNode;
}>;
/** Controlled playback chrome: Steps owns the cursor and Progress owns range semantics. */
export declare function StepPlayer({ descriptor, statusLabels, composeAccessibleName, progress, playing, disabled, labels, onPlayingChange, onReplay, children }: StepPlayerProps): import("react").JSX.Element;
//# sourceMappingURL=step-player.d.ts.map