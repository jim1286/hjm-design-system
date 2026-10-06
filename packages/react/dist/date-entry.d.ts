import { type DateEntryControlProps } from "@hjmds/design-contracts/date-entry";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DateEntryProps = DateEntryControlProps & Readonly<{
    className?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Direct date drafts reuse TextField; Calendar/DatePicker continue to own calendar selection. */
export declare function DateEntry(props: DateEntryProps): import("react").JSX.Element;
//# sourceMappingURL=date-entry.d.ts.map