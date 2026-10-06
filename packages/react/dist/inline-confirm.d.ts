import type { HjmCompositionStyleProp } from "./composition-style.js";
export type InlineConfirmProps = Readonly<{
    label: string;
    prompt: string;
    confirmLabel: string;
    cancelLabel: string;
    pendingLabel: string;
    successLabel: string;
    errorLabel: string;
    disabled?: boolean;
    onConfirm: () => void | Promise<void>;
    /** Canonical layout-only placement, applied to whichever root the current phase renders so the block does not jump. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Low-complexity confirmation using the existing async dialog session semantics. */
export declare function InlineConfirm(props: InlineConfirmProps): import("react").JSX.Element;
//# sourceMappingURL=inline-confirm.d.ts.map