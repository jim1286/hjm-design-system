import type { ToastDescriptor } from "../../packages/design-contracts/src/toast.js";

// Fixture for the activity-status composition (2026-10-10). Copy, steps and timing are synthetic;
// a product supplies its own task state, localized copy and mascot media.
export type ActivityStatusPhase = "idle" | "running" | "done";
export type ActivityStatusProps = { initial?: "idle" | "running" };

export const activityStatusCopy = {
  screenTitle: "내 작업",
  back: "뒤로",
  start: "작업 시작",
  restart: "다시 시작",
  body: "작업을 시작하면 위쪽 상태 칩을 눌러 진행 패널을 열고 닫을 수 있어요.",
  fixture: "합성 진행 예제예요. 실제 작업 상태와 결과 화면은 제품에서 연결해요.",
  region: "알림",
  close: "패널 닫기",
  chipRunning: "다듬는 중",
  chipDone: "완료",
  chipRunningSpoken: "작업 진행 중, 진행 패널 보기",
  chipDoneSpoken: "작업 완료, 결과 패널 보기",
  title: "도우미",
  running: "앱을 다듬고 있어요. 다른 화면을 봐도 계속 진행돼요.",
  done: "다 됐어요. 바뀐 결과를 확인해 보세요.",
  openResult: "결과 보기",
  resultOpened: "결과 화면은 제품이 연결해요.",
} as const;

export const activityStatusSteps = ["읽기", "다듬기", "확인"] as const;
export const activityStatusToastId = "activity-status";
/** Fixture pacing only; a product advances steps from its own task events. */
export const activityStatusStepMs = 1600;
/** How long the chip keeps the result label before it leaves the header. */
export const activityStatusResultMs = 4000;

export function activityStatusDescriptor(
  phase: Exclude<ActivityStatusPhase, "idle">,
  step: number,
  media: unknown,
  handlers: Readonly<{ onDismiss: () => void; onOpenResult: () => void }>,
): ToastDescriptor {
  const copy = activityStatusCopy;
  return {
    id: activityStatusToastId,
    title: copy.title,
    description: phase === "running" ? copy.running : copy.done,
    tone: phase === "running" ? "neutral" : "success",
    // Persistent while the panel is the user's chosen view; the chip or close button dismisses it.
    durationMs: null,
    media,
    ...(phase === "running"
      ? { progress: { steps: activityStatusSteps, current: step } }
      : { action: { label: copy.openResult, onAction: handlers.onOpenResult } }),
    closeLabel: copy.close,
    onDismiss: handlers.onDismiss,
  };
}
