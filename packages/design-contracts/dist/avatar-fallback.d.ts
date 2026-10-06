/** Avatar owns the accessible name; fallback artwork must remain decorative. */
export type AvatarFallbackContext = Readonly<{
    size: number;
    decorative: true;
}>;
/**
 * Initials shown when an Avatar has no image: the first character of the first and the last word,
 * counted in code points, upper-cased for the current locale. `provided` (Native `initials`) wins and
 * keeps at most three code points.
 *
 * 2026-10-06 follow-up: Web took the first two words and Native the first and last, so the same
 * "Kim Min Jun" read "KM" on Web and "KJ" on Native. First+last was kept because the family and
 * given names sit at the two ends of a name with middle names; the first-two rule shows a middle
 * name instead. Native also indexed UTF-16 units and could split a surrogate pair; code points fix it.
 */
export declare function resolveAvatarInitials(name: string, provided?: string): string;
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