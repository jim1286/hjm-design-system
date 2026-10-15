import { type ReactNode } from "react";
import { type AnswerStreamEvent, type AnswerGenerationContext } from "@hjmds/design-contracts/streaming-answer";
export type StreamingAnswerProps = Readonly<{
    answerId: string;
    initialText?: string;
    label: string;
    onGenerate: (context: AnswerGenerationContext) => AsyncIterable<AnswerStreamEvent> | Promise<AsyncIterable<AnswerStreamEvent>>;
    labels: Readonly<{
        generate: string;
        regenerate: string;
        stop: string;
        thinking: string;
        streaming: string;
        stopping: string;
        complete: string;
        stopped: string;
        error: string;
    }>;
    thinkingIndicator?: ReactNode;
    renderText?: (text: string) => ReactNode;
    disabled?: boolean;
}>;
export declare function StreamingAnswer(props: StreamingAnswerProps): import("react").JSX.Element;
//# sourceMappingURL=streaming-answer.d.ts.map