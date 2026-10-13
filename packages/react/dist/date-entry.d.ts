import { type DateEntryControlProps } from "@hjmds/design-contracts/date-entry";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DateEntryProps = DateEntryControlProps & Readonly<{
    className?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Date policy stays here; FieldGroup owns related-input semantics, feedback and edit lifetime. */
export declare function DateEntry(props: DateEntryProps): import("react").JSX.Element;
//# sourceMappingURL=date-entry.d.ts.map