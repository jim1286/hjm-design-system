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
}>;
export declare function InlineConfirm(props: InlineConfirmProps): import("react").JSX.Element;
//# sourceMappingURL=inline-confirm.d.ts.map