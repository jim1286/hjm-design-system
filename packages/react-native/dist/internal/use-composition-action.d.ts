export declare function useCompositionAction(disabled?: boolean): {
    session: Readonly<{
        getSnapshot(): import("@hjmds/design-contracts/action-session").ActionSnapshot<string | null>;
        subscribe(listener: () => void): () => void;
        run(task: import("@hjmds/design-contracts/action-session").ActionTask<string | null>, options?: Readonly<{
            optimisticValue?: string | null;
            retryable?: boolean;
        }> | undefined): Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<string | null>>;
        retry(): Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<string | null>>;
        reset(value: string | null): void;
    }>;
    pending: boolean;
    failed: boolean;
    active: string | null;
    run: (key: string, task: () => void | Promise<void>) => Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<string | null>>;
};
//# sourceMappingURL=use-composition-action.d.ts.map