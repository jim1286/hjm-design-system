import { type CelebrationPreset } from "@hjmds/design-contracts/components/interaction-adapters";
export type CelebrationProps = {
    eventId: string;
    preset?: CelebrationPreset;
    onComplete?(): void;
};
export declare function Celebration({ eventId, preset, onComplete }: CelebrationProps): import("react").JSX.Element | null;
//# sourceMappingURL=celebration.d.ts.map