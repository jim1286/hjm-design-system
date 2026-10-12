import type { ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { type ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type { ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";
export type ActivityChipProps = Readonly<{
    /** Short visible status, for example "Polishing". */
    label: string;
    /** Full spoken status; defaults to `label`. */
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** `emphasis` marks a result waiting for the user. */
    emphasis?: ActivityChipEmphasis;
    /** Whether the panel this chip toggles is open (`accessibilityState.expanded`). */
    expanded?: boolean;
    /** Decorative leading visual (mascot, avatar); hidden from assistive technology. */
    media?: ReactNode;
    onPress: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
/**
 * Pressable status of one running task. It is a disclosure trigger for the matching panel toast
 * (composition `activity-status`), so it reports `expanded` instead of Chip's selection roles.
 */
export declare function ActivityChip({ label, accessibilityLabel, accessibilityHint, emphasis, expanded, media, onPress, disabled, layoutStyle, testID, }: ActivityChipProps): import("react").JSX.Element;
//# sourceMappingURL=activity-chip.d.ts.map