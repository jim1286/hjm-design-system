export declare function useCompositionAction<T = string>(disabled?: boolean): {
    session: Readonly<{
        getSnapshot(): import("@hjmds/design-contracts/action-session").ActionSnapshot<T | null>;
        subscribe(listener: () => void): () => void;
        run(task: import("@hjmds/design-contracts/action-session").ActionTask<T | null>, options?: Readonly<{
            optimisticValue?: T | null;
            retryable?: boolean;
        }> | undefined): Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<T | null>>;
        retry(): Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<T | null>>;
        reset(value: T | null): void;
    }>;
    pending: boolean;
    failed: boolean;
    active: T | null;
    run: (key: T, task: () => void | Promise<void>) => Promise<import("@hjmds/design-contracts/action-session").ActionOutcome<T | null>>;
};
//# sourceMappingURL=use-composition-action.d.ts.map