export type AnswerStreamEvent = Readonly<{
    type: "delta";
    text: string;
}> | Readonly<{
    type: "done";
}>;
export type AnswerStreamResult = Readonly<{
    phase: "complete" | "stopped";
    text: string;
}>;
export type AnswerGenerationContext = Readonly<{
    signal: AbortSignal;
    previousText: string;
    regenerate: boolean;
}>;
/** Consume actual provider events, never a timer or character-replay queue. */
export declare function consumeAnswerStream(source: AsyncIterable<AnswerStreamEvent>, signal: AbortSignal, previousText: string, report: (text: string) => void): Promise<AnswerStreamResult>;
//# sourceMappingURL=streaming-answer.d.ts.map