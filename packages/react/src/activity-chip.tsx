import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import {
  activityChipRecipe,
  resolveActivityChipDescriptor,
  type ActivityChipEmphasis,
} from "@hjmds/design-contracts/activity-chip";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type { ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";

// Raw `style` is excluded like other recipe-owned controls: placement goes through `layoutStyle`,
// colour through `emphasis` and the provider palette.
export type ActivityChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "style" | "aria-expanded" | "aria-label"
> &
  Readonly<{
    /** Short visible status, for example "Polishing". */
    label: string;
    /** Full spoken status; defaults to `label`. */
    accessibilityLabel?: string;
    /** `emphasis` marks a result waiting for the user. */
    emphasis?: ActivityChipEmphasis;
    /** Whether the panel this chip toggles is open (`aria-expanded`). */
    expanded?: boolean;
    /** Decorative leading visual (mascot, avatar); hidden from assistive technology. */
    media?: ReactNode;
    /** Canonical layout-only placement on the root button. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/**
 * Pressable status of one running task. It is a disclosure trigger for the matching panel toast
 * (composition `activity-status`), so it exposes `aria-expanded` instead of Chip's selection roles.
 */
const recipeStyle = {
  "--hjm-activity-chip-max-width": `${activityChipRecipe.root.maxWidth}px`,
  "--hjm-activity-chip-media-size": `${activityChipRecipe.media.size}px`,
  "--hjm-activity-chip-pressed-opacity": String(activityChipRecipe.root.pressedOpacity),
} as CSSProperties;

export const ActivityChip = forwardRef<HTMLButtonElement, ActivityChipProps>(function ActivityChip(
  { label, accessibilityLabel, emphasis, expanded, media, layoutStyle, className, ...props },
  ref,
) {
  const resolved = resolveActivityChipDescriptor({
    label,
    ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
    ...(emphasis === undefined ? {} : { emphasis }),
    ...(expanded === undefined ? {} : { expanded }),
  });
  const hasMedia = media !== undefined && media !== null;
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={classNames("hjm-activity-chip", className)}
      data-emphasis={resolved.emphasis}
      data-media={hasMedia ? "true" : undefined}
      aria-expanded={resolved.expanded}
      // Only name the button separately when the spoken status differs from the visible one.
      aria-label={accessibilityLabel === undefined ? undefined : resolved.accessibilityLabel}
      style={{ ...recipeStyle, ...layoutStyle }}
    >
      {!hasMedia ? null : (
        <span className="hjm-activity-chip__media" aria-hidden="true">{media}</span>
      )}
      <span className="hjm-activity-chip__label">{resolved.label}</span>
    </button>
  );
});
