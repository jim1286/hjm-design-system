import type { TransferContext } from "../../packages/design-contracts/src/transfer-task.js";
export const transferLabels = { start: "예제 영상 전송", queued: "응답 대기", transferring: "실제 전송 중", cancel: "취소", cancelling: "취소 확인 중", cancelled: "전송이 취소됐어요", success: "전송을 완료했어요", error: "전송하지 못했어요. 다시 시도하세요." };
/** One caption for both platforms; the asset source differs per platform but the user-facing meaning does not. */
export const transferCaption = "예제 영상을 실제로 받아 오며 진행을 보여 줘요. 파일 저장·공유는 제품에서 연결해요.";
export const formatTransfer = (p: { completed: number; total: number | null }) => `${p.completed.toLocaleString("ko-KR")} B / ${p.total === null ? "전체 크기 미정" : `${p.total.toLocaleString("ko-KR")} B`}`;
/** Consume real response chunks. Disk save/delivery confirmation is a separate product operation. */
export async function receiveTransfer(response: Pick<Response, "ok" | "body" | "headers">, { signal, report }: TransferContext) {
  if (!response.ok || !response.body) throw new Error("The response has no readable transfer body");
  const rawTotal = Number(response.headers.get("content-length"));
  // Content-Length can describe compressed bytes, while the stream exposes decoded bytes.
  const total = Number.isFinite(rawTotal) && rawTotal > 0 && !response.headers.get("content-encoding") ? rawTotal : null;
  const reader = response.body.getReader(); let completed = 0, finished = false;
  const abort = () => { void reader.cancel().catch(() => undefined); };
  const assertActive = () => { if (signal.aborted) throw Object.assign(new Error("Transfer aborted"), { name: "AbortError" }); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    assertActive(); report({ completed, total });
    while (true) { const next = await reader.read(); assertActive(); if (next.done) { finished = true; break; } completed += next.value.byteLength; report({ completed, total }); }
  } finally { signal.removeEventListener("abort", abort); if (!finished) await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
