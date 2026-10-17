// 2026-10-17 screen compositions registered. Minimal previews for the screen composition catalog rows; the richer flows stay in the
// 화면 stories. Products use the same public subpaths; nothing here is showcase-only API.
import { ChatMessage, ChatScreen, CompositionLayout, IconTile, MessageComposer, NotificationInboxScreen, NotificationItem, NotificationRow, ScreenLayout, SettingsScreen } from "@hjmds/react/screens";
import { CommentThreadRow, CommentThreadScreen, EditorScreen, ListDetailScreen, MediaSelectionScreen, ModerationScreen, OnboardingScreen, PermissionScreen, PhotoSourceSheet, ProfileScreen, ProfileSummary, SearchScreen } from "@hjmds/react/screen-flows";
import { Text } from "@hjmds/react/layout";
import { useState } from "react";

const noop = () => {};
const action = (label: string) => ({ label, onAction: noop });
const discard = { mode: "confirm" as const, title: "초안을 버릴까요?", description: "입력이 사라집니다", confirmLabel: "버리기", cancelLabel: "계속 작성", fallbackErrorMessage: "실패" };
const uploadLabels = { pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" };
const photoLabels = { title: "사진 가져오기", library: "앨범에서 선택", camera: "카메라로 촬영", cancel: "취소" };
const comments = [{ id: "c1", parentId: null, author: "서연", body: <Text as="span">첫 댓글이에요</Text>, timeLabel: "방금", likeCountLabel: "좋아요 3개", likeIcon: <span aria-hidden="true">♡</span>, likeLabel: "좋아요" }];

export function ScreenLayoutPreview() {
  return <ScreenLayout title="화면"><Text as="p">본문</Text></ScreenLayout>;
}

export function CompositionLayoutPreview() {
  return <CompositionLayout title="구성" description="설명"><Text as="p">본문</Text></CompositionLayout>;
}

export function SettingsScreenPreview() {
  return <SettingsScreen title="설정" sections={[{ id: "account", title: "계정", children: <Text as="p">이메일</Text> }]} />;
}

export function SearchScreenPreview() {
  return <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={noop} onSearch={noop}><Text as="p">결과</Text></SearchScreen>;
}

export function EditorScreenPreview() {
  return <EditorScreen title="작성" dirty={false} submit={action("저장")} cancel={action("닫기")} discard={discard}><Text as="p">본문</Text></EditorScreen>;
}

export function PermissionScreenPreview() {
  return <PermissionScreen title="카메라" status="prompt" explanation={<Text as="p">사진을 올리려면 카메라가 필요해요</Text>} request={action("허용")} settings={action("설정")} continueAction={action("계속")} />;
}

export function OnboardingScreenPreview() {
  return <OnboardingScreen steps={[{ id: "one", title: "시작", description: "안내", content: <Text as="p">내용</Text> }]} index={0} onIndexChange={noop} nextLabel="다음" backLabel="이전" complete={action("완료")} progressLabel={(index, total) => `${index}/${total}`} />;
}

export function ModerationScreenPreview() {
  return <ModerationScreen title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason={null} onReasonChange={noop} reasonLabel="사유" submit={action("보내기")} />;
}

export function ChatScreenPreview() {
  return <ChatScreen title="대화" composer={<Text as="p">작성창</Text>} />;
}

export function NotificationInboxScreenPreview() {
  return <NotificationInboxScreen title="알림"><Text as="p">알림 목록</Text></NotificationInboxScreen>;
}

export function CommentThreadScreenPreview() {
  return <CommentThreadScreen title="댓글" items={comments} expandedIds={[]} onExpandedChange={noop} onLike={noop} onReply={noop} replyLabel="답글" repliesLabel={(count) => `답글 ${count}개`} />;
}

export function ListDetailScreenPreview() {
  return <ListDetailScreen title="목록" list={<Text as="p">목록</Text>} back={action("뒤로")} />;
}

export function MediaSelectionScreenPreview() {
  return <MediaSelectionScreen title="사진 선택" items={[]} done={action("완료")} labels={uploadLabels} actionLabels={{ remove: "제거", moveUp: "위로", moveDown: "아래로" }} removeLabel={() => "제거"} moveUpLabel={() => "위로"} moveDownLabel={() => "아래로"} onRemove={noop} onMove={noop} onRetry={noop} onCancel={noop} />;
}

export function ProfileScreenPreview() {
  return <ProfileScreen title="프로필" summary={<Text as="p">요약</Text>} edit={action("편집")} />;
}

export function ChatMessagePreview() {
  return <ChatMessage direction="incoming" author="서연" timestamp="지금">안녕하세요</ChatMessage>;
}

export function NotificationRowPreview() {
  return <NotificationRow preview={<Text as="span">새 답글이 달렸어요</Text>} metadata="방금" avatar={<span aria-hidden="true">S</span>} />;
}

export function NotificationItemPreview() {
  return <NotificationItem title="답글" read={false} statusLabel="읽지 않음" timestamp="방금" />;
}

export function CommentThreadRowPreview() {
  return <CommentThreadRow item={comments[0]!} onLike={noop} onReply={noop} replyLabel="답글" />;
}

export function ProfileSummaryPreview() {
  return <ProfileSummary name="서연" avatar={<span aria-hidden="true">S</span>} />;
}

export function IconTilePreview() {
  return <IconTile icon={<span aria-hidden="true">★</span>} label="도구" />;
}

export function MessageComposerPreview() {
  const [value, setValue] = useState("");
  return <MessageComposer value={value} label="메시지" sendLabel="전송" onValueChange={setValue} onSend={() => setValue("")} />;
}

export function PhotoSourceSheetPreview() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>사진 가져오기</button>
    <PhotoSourceSheet open={open} onOpenChange={setOpen} onSelect={() => setOpen(false)} labels={photoLabels} />
  </>;
}
