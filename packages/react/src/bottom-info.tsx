import {
  bottomInfoRecipe,
  validateBottomInfoDescriptor,
  type BottomInfoDescriptor,
} from "@hjmds/design-contracts/components/bottom-info";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type BottomInfoProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  BottomInfoDescriptor &
  Readonly<{
    /** Replaces one line with rich copy (a link inside the sentence, for example). */
    renderItem?: (item: string, index: number) => ReactNode;
    className?: string;
  }>;

export const BottomInfo = forwardRef<HTMLElement, BottomInfoProps>(function BottomInfo(
  { items, tone = bottomInfoRecipe.defaults.tone, renderItem, className, ...props },
  forwardedRef,
) {
  validateBottomInfoDescriptor({ items, tone });
  // A single line reads as a sentence; several read as a list. Marking one line
  // with a bullet is noise, which is why the recipe carries the threshold.
  const asList = items.length >= bottomInfoRecipe.listMarkerFrom;
  return (
    <aside
      {...props}
      ref={forwardedRef}
      className={classNames("hjm-bottom-info", className)}
      data-tone={tone}
      data-list={asList || undefined}
    >
      {asList ? (
        <ul className="hjm-bottom-info__list">
          {items.map((item, index) => (
            <li key={item} className="hjm-bottom-info__item">{renderItem?.(item, index) ?? item}</li>
          ))}
        </ul>
      ) : (
        <p className="hjm-bottom-info__item">{renderItem?.(items[0]!, 0) ?? items[0]}</p>
      )}
    </aside>
  );
});
