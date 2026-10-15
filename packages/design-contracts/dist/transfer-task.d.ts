export type TransferObservation = Readonly<{
    completed: number;
    total: number | null;
}>;
/** Actual transport counts only. Learning the total never manufactures completed work. */
export declare function resolveTransferObservation(next: TransferObservation, previous?: TransferObservation | null): TransferObservation;
export type TransferContext = Readonly<{
    signal: AbortSignal;
    report: (observation: TransferObservation) => void;
}>;
/** An abort request is not proof of cancellation: the adapter must reject with AbortError. */
export declare function isConfirmedTransferAbort(error: unknown, signal: AbortSignal): boolean;
//# sourceMappingURL=transfer-task.d.ts.map