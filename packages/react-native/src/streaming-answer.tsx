"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { consumeAnswerStream, type AnswerStreamEvent, type AnswerGenerationContext } from "@hjmds/design-contracts/streaming-answer";
import { Button } from "./actions.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export type StreamingAnswerProps = Readonly<{
  answerId: string; initialText?: string; label: string;
  onGenerate: (context: AnswerGenerationContext) => AsyncIterable<AnswerStreamEvent> | Promise<AsyncIterable<AnswerStreamEvent>>;
  labels: Readonly<{ generate: string; regenerate: string; stop: string; thinking: string; streaming: string; stopping: string; complete: string; stopped: string; error: string }>;
  thinkingIndicator?: ReactNode; renderText?: (text: string) => ReactNode; disabled?: boolean;
}>;
type Phase = "idle" | "thinking" | "streaming" | "stopping" | "complete" | "stopped" | "error";
export function StreamingAnswer(props: StreamingAnswerProps) {
  if (!props.answerId.trim()) throw new TypeError("Streaming answers require a stable id");
  return <AnswerBody key={props.answerId} {...props} />;
}
function AnswerBody(props: StreamingAnswerProps) {
  const [text, setText] = useState(props.initialText ?? ""), [phase, setPhase] = useState<Phase>(props.initialText ? "complete" : "idle");
  const action = useCompositionAction(props.disabled), request = useRef<AbortController | null>(null), mounted = useRef(true), disabled = useRef(props.disabled), requestWasRegenerate = useRef(false);
  disabled.current = props.disabled;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); request.current = null; }; }, []);
  const generate = () => {
    if (!mounted.current || disabled.current || request.current) return;
    const controller = new AbortController(); request.current = controller;
    const previousText = text, regenerate = phase !== "idle"; requestWasRegenerate.current = regenerate;
    setPhase("thinking");
    const current = () => mounted.current && request.current === controller;
    void action.run("generate", async () => {
      try {
        const source = await props.onGenerate({ signal: controller.signal, previousText, regenerate });
        const result = await consumeAnswerStream(source, controller.signal, previousText, value => { if (current()) { setText(value); setPhase("streaming"); } });
        if (current()) { setText(result.text); setPhase(result.phase); }
      } catch (error) {
        const aborted = controller.signal.aborted && error && typeof error === "object" && "name" in error && error.name === "AbortError";
        if (current()) setPhase(aborted ? "stopped" : "error");
        throw error;
      }
    }).then(() => { if (request.current === controller) request.current = null; });
  };
  const stop = () => { if (mounted.current && !disabled.current && request.current && !request.current.signal.aborted) { setPhase("stopping"); request.current.abort(); } };
  const pending = action.pending;
  const status = phase === "idle" ? null : props.labels[phase];
  return <Stack gap="md"><Text emphasis="strong">{props.label}</Text>
    {text ? (props.renderText ? props.renderText(text) : <Text>{text}</Text>) : null}
    {phase === "thinking" ? <Stack align="center" justify="center">{props.thinkingIndicator ?? <Progress label={props.labels.thinking} />}</Stack> : null}
    <Stack axis="inline" gap="xs" wrap><Button loading={pending} disabled={props.disabled === true} onPress={generate}>{(pending ? requestWasRegenerate.current : phase !== "idle") ? props.labels.regenerate : props.labels.generate}</Button>
      {pending ? <Button tone="secondary" disabled={props.disabled === true || phase === "stopping"} onPress={stop}>{props.labels.stop}</Button> : null}</Stack>
    {status && phase !== "thinking" ? <Text accessibilityRole={phase === "error" ? "alert" : "text"} accessibilityLiveRegion="polite" align="center" tone={phase === "error" ? "danger" : "primary"}>{status}</Text> : null}
  </Stack>;
}
