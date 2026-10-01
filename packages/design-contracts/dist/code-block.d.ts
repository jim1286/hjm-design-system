export type CodeToken = Readonly<{
    text: string;
    tone?: 'plain' | 'keyword' | 'string' | 'comment' | 'number';
}>;
export type CodeBlockDescriptor = Readonly<{
    code: string;
    label: string;
    language?: string;
    tokens?: readonly CodeToken[];
    wrap?: boolean;
}>;
/** Highlighting is presentation only: it must not change selectable/copied source. */
export declare function resolveCodeBlock(input: CodeBlockDescriptor): {
    tokens: readonly Readonly<{
        text: string;
        tone?: "plain" | "keyword" | "string" | "comment" | "number";
    }>[];
    wrap: boolean;
    code: string;
    label: string;
    language?: string;
};
//# sourceMappingURL=code-block.d.ts.map