export type AnswerStreamEvent = Readonly<{ type: "delta"; text: string }> | Readonly<{ type: "done" }>;
export type AnswerStreamResult = Readonly<{ phase: "complete" | "stopped"; text: string }>;
export type AnswerGenerationContext = Readonly<{ signal: AbortSignal; previousText: string; regenerate: boolean }>;
async function closeIterator(iterator: AsyncIterator<AnswerStreamEvent>) {
  if (!iterator.return) return;
  // Async generators can yield from finally; return() alone is not a closed-stream acknowledgement.
  let result = await iterator.return();
  while (!result.done) result = await iterator.next();
}
/** Consume actual provider events, never a timer or character-replay queue. */
export async function consumeAnswerStream(source: AsyncIterable<AnswerStreamEvent>, signal: AbortSignal, previousText: string, report: (text: string) => void): Promise<AnswerStreamResult> {
  const iterator = source[Symbol.asyncIterator](); let text = previousText, received = false, ended = false;
  try {
    while (true) {
      // A provider must connect signal to its transport. return() acknowledges early stream closure.
      if (signal.aborted && iterator.return) { await closeIterator(iterator); ended = true; return { phase: "stopped", text }; }
      const next = await iterator.next();
      if (next.done) { ended = true; if (signal.aborted) return { phase: "stopped", text }; throw new Error("Answer stream ended without its provider completion event"); }
      if (next.value.type === "done") return { phase: "complete", text: received ? text : "" };
      if (signal.aborted) continue;
      if (next.value.type !== "delta" || typeof next.value.text !== "string") throw new TypeError("Invalid answer stream event");
      if (!next.value.text) continue;
      if (!received) { text = ""; received = true; }
      text += next.value.text; report(text);
    }
  } catch (error) {
    if (signal.aborted && error && typeof error === "object" && "name" in error && error.name === "AbortError") return { phase: "stopped", text };
    throw error;
  } finally {
    if (!ended) {
      try { await closeIterator(iterator); }
      catch (error) { if (!(signal.aborted && error && typeof error === "object" && "name" in error && error.name === "AbortError")) throw error; }
    }
  }
}
