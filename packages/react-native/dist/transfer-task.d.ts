import { type TransferObservation, type TransferContext } from "@hjmds/design-contracts/transfer-task";
export type TransferTaskProps = Readonly<{
    onTransfer: (context: TransferContext) => Promise<void>;
    labels: Readonly<{
        start: string;
        queued: string;
        transferring: string;
        cancel: string;
        cancelling: string;
        cancelled: string;
        success: string;
        error: string;
    }>;
    formatProgress: (observation: TransferObservation) => string;
    disabled?: boolean;
}>;
export declare function TransferTask(props: TransferTaskProps): import("react").JSX.Element;
//# sourceMappingURL=transfer-task.d.ts.map