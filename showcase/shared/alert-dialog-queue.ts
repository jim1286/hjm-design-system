// Presentation fixtures only. Products own the questions, their copy and what each answer does.
export const alertDialogQueueExample = {
  trigger: "보관함 비우기",
  first: { mode: "confirm", tone: "danger", title: "보관함을 비울까요?", description: "보관한 글 12개가 지워져요.", confirmLabel: "비우기", cancelLabel: "취소" },
  second: { mode: "confirm", title: "알림도 끌까요?", description: "새 보관 알림을 더 받지 않아요.", confirmLabel: "끄기", cancelLabel: "유지" },
  results: { confirmed: "확인", cancelled: "취소" },
  idle: "아직 답한 질문이 없어요.",
} as const;
