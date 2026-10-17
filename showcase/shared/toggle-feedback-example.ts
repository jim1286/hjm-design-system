import type { ToggleFeedbackEffect } from "../../packages/design-contracts/src/toggle-feedback.js";

/** Korean copy and seed counts shared by the Web and Native toggle-feedback previews. */
export const toggleFeedbackExample = {
  hint: "선택할 때만 짧은 반응이 나타나요.",
  failTool: "다음 요청 실패시키기",
  effects: ["ripple", "ribbon", "burst"] as const satisfies readonly ToggleFeedbackEffect[],
  seed: { ripple: 128, ribbon: 24, burst: 56 } satisfies Record<ToggleFeedbackEffect, number>,
  labels: {
    ripple: { select: "구독", selected: "구독 중", count: "구독자" },
    ribbon: { select: "북마크", selected: "북마크됨", count: "저장" },
    burst: { select: "좋아요", selected: "좋아요 선택됨", count: "좋아요" },
  } satisfies Record<ToggleFeedbackEffect, { select: string; selected: string; count: string }>,
  pending: "변경 중",
  error: "변경하지 못했어요. 이전 상태를 유지합니다.",
} as const;
