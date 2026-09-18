import { type AgreementDescriptor, type AgreementState } from "@hjmds/design-contracts/components/agreement";
import { type StyleProp, type ViewStyle } from "react-native";
export type AgreementProps<Id extends string = string> = Readonly<{
    descriptor: AgreementDescriptor<Id>;
    checkedIds?: ReadonlySet<Id>;
    defaultCheckedIds?: ReadonlySet<Id>;
    onCheckedIdsChange?: (ids: ReadonlySet<Id>) => void;
    onStateChange?: (state: AgreementState<Id>) => void;
    /** Opens one item's full text. Native has no href, so this is the only path. */
    onDetail?: (id: Id) => void;
    /** Localized suffix marking a required row, supplied by the product. */
    requiredLabel: string;
    /** Localized suffix marking an optional row, supplied by the product. */
    optionalLabel: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Agreement<Id extends string = string>({ descriptor, checkedIds: controlledChecked, defaultCheckedIds, onCheckedIdsChange, onStateChange, onDetail, requiredLabel, optionalLabel, style, }: AgreementProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=agreement.d.ts.map