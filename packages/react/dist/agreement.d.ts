import { type AgreementDescriptor, type AgreementState } from "@hjmds/design-contracts/components/agreement";
export type AgreementProps<Id extends string = string> = Readonly<{
    descriptor: AgreementDescriptor<Id>;
    checkedIds?: ReadonlySet<Id>;
    defaultCheckedIds?: ReadonlySet<Id>;
    onCheckedIdsChange?: (ids: ReadonlySet<Id>) => void;
    /** Fires the derived state on every change, for a submit button to read. */
    onStateChange?: (state: AgreementState<Id>) => void;
    /** Called when an item's full text is requested and it carries no href. */
    onDetail?: (id: Id) => void;
    /** Localized suffix marking a required row, supplied by the product. */
    requiredLabel: string;
    /** Localized suffix marking an optional row, supplied by the product. */
    optionalLabel: string;
    className?: string;
}>;
export declare const Agreement: <Id extends string = string>(props: AgreementProps<Id> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=agreement.d.ts.map