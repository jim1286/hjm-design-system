import type { AnswerStreamEvent, AnswerGenerationContext } from "../../packages/design-contracts/src/streaming-answer.js";
export const answerLabels = { generate: "응답 받기", regenerate: "다시 받기", stop: "중지", thinking: "실제 응답 대기", streaming: "응답 수신 중", stopping: "중지 확인 중", complete: "응답 완료", stopped: "수신을 중지했어요", error: "응답을 받지 못했어요. 받은 부분은 남아 있어요." };
/** Visible example copy shared by Web and Native. Provider/auth ownership lives in the usage guide, not the UI. */
export const streamingExampleCopy = { endpoint: "텍스트 스트림 주소", caption: "주소를 넣으면 실제 응답을 받아 와요. 미리 정한 답변은 재생하지 않아요." } as const;
/** Plain UTF-8 transport example. Products map their provider's SSE/WebSocket events separately. */
export async function* readTextAnswer(response: Pick<Response, "ok" | "headers" | "body">, { signal }: Pick<AnswerGenerationContext, "signal">): AsyncGenerator<AnswerStreamEvent> {
  if (!response.ok || !response.body || !response.headers.get("content-type")?.startsWith("text/plain")) throw new Error("Expected a successful plain UTF-8 text stream");
  const reader = response.body.getReader(), decoder = new TextDecoder("utf-8", { fatal: true }); let ended = false;
  const assertActive = () => { if (signal.aborted) throw Object.assign(new Error("Stream aborted"), { name: "AbortError" }); };
  const abort = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    while (true) { assertActive(); const next = await reader.read(); assertActive(); if (next.done) { ended = true; break; } const text = decoder.decode(next.value, { stream: true }); if (text) yield { type: "delta", text }; }
    const tail = decoder.decode(); if (tail) yield { type: "delta", text: tail }; assertActive(); yield { type: "done" };
  } finally { signal.removeEventListener("abort", abort); if (!ended) await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
