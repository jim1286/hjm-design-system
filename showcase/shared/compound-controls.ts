const units = { hours: "시간", minutes: "분", seconds: "초" };
export const durationLabels = {
  label: "집중할 시간", ...units,
  increment: (unit: keyof typeof units) => `${units[unit]} 늘리기`, decrement: (unit: keyof typeof units) => `${units[unit]} 줄이기`,
};
export const compoundCopy = {
  durationTitle: "나에게 맞는 속도로.", durationDescription: "시간·분·초를 조절해 다음 집중 시간을 정해요.",
  total: (seconds: number) => `총 ${seconds.toLocaleString()}초`,
  confirmTitle: "중요한 동작은 한 번 더.", confirmDescription: "확인하는 동안에도 주변 맥락은 그대로 유지돼요.",
  confirm: { label: "초안 삭제", prompt: "이 초안을 삭제할까요?", confirmLabel: "삭제하기", cancelLabel: "유지하기", pendingLabel: "삭제 중", successLabel: "초안을 삭제했어요.", errorLabel: "삭제하지 못했어요. 다시 시도해 주세요." },
  fail: "실패 응답 보기", reset: "예제 다시 시작", saved: "이 예제는 로컬 상태만 변경합니다.",
};

/** Simulated latency makes the pending state reviewable; no server mutation. */
export async function runConfirmationPreview(shouldFail: () => boolean) {
  await new Promise(resolve => setTimeout(resolve, 600));
  if (shouldFail()) throw new Error("Demo failure");
}

export const socialCopy = {
  title: "작은 반응이 대화를 이어줘요.", group: "반응 고르기", like: "좋아요", love: "마음에 들어요", celebrate: "축하해요", inspired: "영감을 받았어요",
  notifications: (count: number) => `알림, 읽지 않은 항목 ${count}개`, add: "새 알림 추가", hint: "종을 누르면 이 예제의 알림을 읽음으로 바꿉니다.",
};
export const reactionOptions = [
  {id:'like',emoji:'👍',label:socialCopy.like}, {id:'love',emoji:'💜',label:socialCopy.love},
  {id:'celebrate',emoji:'🎉',label:socialCopy.celebrate}, {id:'inspired',emoji:'✨',label:socialCopy.inspired},
];
