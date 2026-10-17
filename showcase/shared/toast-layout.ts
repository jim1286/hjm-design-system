// Toast layout comparison descriptors shared by Web and Native so both renderers draw the same cards.
// durationMs null keeps each card on screen for comparison; product toasts keep their default timeout.
const noop = () => {};
export const toastLayoutExamples = {
  compact: { id: "saved", description: "저장했어요", closeLabel: "닫기", durationMs: null },
  liquid: { id: "generation-ready", presentation: "liquid", title: "아이디어가 완성됐어요", description: "결과를 확인해 보세요.",
    closeLabel: "완료 알림 닫기", tone: "success", durationMs: null, action: { label: "결과 열기", onAction: noop } },
  longCopy: { id: "retry", title: "연결을 확인해 주세요", description: "Your changes remain available. 연결이 복구되면 다시 시도할 수 있어요.",
    closeLabel: "알림 닫기", durationMs: null, action: { label: "다시 시도하기 Try again", onAction: noop, dismissOnAction: false } },
  tones: [
    { id: "g-neutral", title: "검토하고 있어요", description: "다 되면 알려 드릴게요. 그동안 써 보셔도 돼요.", closeLabel: "닫기", durationMs: null },
    { id: "g-success", tone: "success", title: "검토 완료", description: "번뚝 타이머를 다듬었어요. 새 버전으로 저장할까요?", closeLabel: "닫기", durationMs: null, action: { label: "새 버전으로 저장", onAction: noop } },
    { id: "g-info", tone: "info", description: "새 버전으로 저장했어요", closeLabel: "닫기", durationMs: null },
    { id: "g-warning", tone: "warning", title: "연결이 불안정해요", description: "잠시 후 다시 시도해 주세요.", closeLabel: "닫기", durationMs: null },
    { id: "g-danger", tone: "danger", description: "저장하지 못했어요", closeLabel: "닫기", durationMs: null, action: { label: "다시 시도", onAction: noop } },
  ],
} as const;
