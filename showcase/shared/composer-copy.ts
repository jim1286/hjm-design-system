// Purpose copy shared by the Web and Native composer previews, like a product's purpose→i18n-key table.
// Comment and message differ only here and in slots; one table keeps both platforms' copy identical.
export const composerCopy = {
  comment: { title: "댓글 작성", label: "댓글을 남겨 주세요", send: "등록", reply: "답글 대상 선택", replyCancel: "답글 취소" },
  message: { title: "메시지 작성", label: "메시지 입력", send: "전송", reply: "답장할 메시지 선택", replyCancel: "답장 취소" },
} as const;
export type ComposerPurpose = keyof typeof composerCopy;
export const composerPreviewNote = "예제 전송은 서버에 저장하지 않아요. 줄바꿈은 입력에 남고, 성공한 뒤에만 초안을 지워요.";
export const composerEndPendingLabel = "대기 예제 종료";
// Fixture hint for the reply composer; platform-neutral, so it names no keyboard shortcut or message id.
export const replyComposerPreviewNote = "받은 메시지를 옆으로 밀면 답장 대상으로 지정돼요. 보낸 답장은 서버에 저장하지 않아요.";
