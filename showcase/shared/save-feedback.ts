import type { ToastDescriptor } from "@hjmds/design-contracts/components/toast";

// Presentation fixtures only. Persistence and product messages stay with each consumer.
export const saveFeedbackExample = {
  subject: "KE123", detail: "인천 → 도쿄", saved: "저장됨", result: "내 항공편에 추가했어요",
  compact: { id: "save-compact", description: "KE123 저장했어요", tone: "success", closeLabel: "닫기", durationMs: null },
  summary: { id: "save-summary", title: "항공편을 저장했어요", description: "KE123 · 인천 → 도쿄", tone: "success", closeLabel: "닫기", durationMs: null },
} as const satisfies { subject: string; detail: string; saved: string; result: string; compact: ToastDescriptor; summary: ToastDescriptor };
export type SaveFeedbackExampleVariant = "compact" | "summary" | "inline";
