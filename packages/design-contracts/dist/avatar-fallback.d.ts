/** Avatar owns the accessible name; fallback artwork must remain decorative. */
export type AvatarFallbackContext = Readonly<{
    size: number;
    decorative: true;
}>;
export type BlobatarFallbackOptions = Readonly<{
    /** Stable public product identifier, never a default email or display name. */
    seed: string;
    expression?: "idle" | "happy";
}>;
export declare function resolveBlobatarFallback(options: BlobatarFallbackOptions): Required<BlobatarFallbackOptions>;
export type BlobatarMotionExpression = 'idle' | 'happy' | 'sad' | 'surprised' | 'wink' | 'sleepy' | 'thinking';
export type BlobatarMotionOptions = Readonly<{
    seed: string;
    expression?: BlobatarMotionExpression;
    active?: boolean;
    visible?: boolean;
}>;
export declare function resolveBlobatarMotion(options: BlobatarMotionOptions): {
    seed: string;
    expression: BlobatarMotionExpression;
    active: boolean;
    visible: boolean;
};
//# sourceMappingURL=avatar-fallback.d.ts.map