// 2026-10-17 screen compositions registered. Minimal previews for the screen composition catalog rows; the richer flows stay in the
// 화면 stories. Products use the same public subpaths; nothing here is showcase-only API.
import { ChatDateSeparator, ChatMessage, ChatScreen, CompositionLayout, IconTile, MessageComposer, NotificationInboxScreen, NotificationItem, NotificationRow, ScreenLayout, SettingsScreen, TypingIndicator } from "@hjmds/react/screens";
import { CommentThreadRow, CommentThreadScreen, EditorScreen, ListDetailScreen, MediaSelectionScreen, ModerationScreen, OnboardingScreen, PermissionScreen, PhotoSourceSheet, ProfileScreen, ProfileSummary, SearchScreen } from "@hjmds/react/screen-flows";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { MediaSelectionCell, type MediaSelectionItem } from "@hjmds/react/screen-flows";
import { useState } from "react";
import { PreviewPhoto } from "./reference-screen-parts";

const noop = () => {};
const action = (label: string) => ({ label, onAction: noop });
const discard = { mode: "confirm" as const, title: "초안을 버릴까요?", description: "입력이 사라집니다", confirmLabel: "버리기", cancelLabel: "계속 작성", fallbackErrorMessage: "실패" };
const uploadLabels = { pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" };
const photoLabels = { title: "사진 가져오기", library: "앨범에서 선택", camera: "카메라로 촬영", cancel: "취소" };
const comments = [{ id: "c1", parentId: null, author: "서연", body: <Text as="span">첫 댓글이에요</Text>, timeLabel: "방금", likeCountLabel: "좋아요 3개", likeIcon: <span aria-hidden="true">♡</span>, likeLabel: "좋아요" }];

// Stand-in product artwork for the header mark and the brand loader (2026-10-18 titleLeading / loadingIndicator).
const previewMark = <span style={{ display: "block", inlineSize: 28, blockSize: 28, borderRadius: 8, background: "var(--hjm-color-content-brand)" }} />;
export function ScreenLayoutPreview() {
  return <Stack gap="lg">
    <div style={{ blockSize: 200 }}><ScreenLayout as="section" title="화면" titleLeading={previewMark}><Text as="p">본문</Text></ScreenLayout></div>
    <div style={{ blockSize: 200 }}><ScreenLayout as="section" title="브랜드 로딩" state={{ kind: "loading", title: "불러오는 중" }} loadingIndicator={<span style={{ fontSize: 32 }}>🌼</span>} /></div>
  </Stack>;
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

const mediaItemActions = { labels: uploadLabels, actionLabels: { remove: "제거", moveUp: "위로", moveDown: "아래로" }, removeLabel: (item: MediaSelectionItem) => `${item.descriptor.name} 제거`, moveUpLabel: (item: MediaSelectionItem) => `${item.descriptor.name} 위로`, moveDownLabel: (item: MediaSelectionItem) => `${item.descriptor.name} 아래로`, onRemove: noop, onMove: noop, onRetry: noop, onCancel: noop };
// 2026-10-18: rotate is an optional item action; the product stores the turn and applies it to its own preview.
// MediaSelectionCell is the same cell a virtualized host renders from renderItem.
export function MediaSelectionScreenPreview() {
  const [turns, setTurns] = useState<Readonly<Record<string, number>>>({});
  const items: MediaSelectionItem[] = [0, 1].map(index => ({ descriptor: { id: String(index), name: `사진 ${index + 1}`, state: { status: "success" } }, preview: <div style={{ transform: `rotate(${(turns[String(index)] ?? 0) * 90}deg)` }}><PreviewPhoto index={index} square label="" /></div> }));
  const rotate = { label: "회전", itemLabel: (item: MediaSelectionItem) => `${item.descriptor.name} 회전`, onRotate: (id: string) => setTurns(current => ({ ...current, [id]: ((current[id] ?? 0) + 1) % 4 })) };
  return <Stack gap="xl">
    <MediaSelectionScreen title="사진 선택" items={items} done={action("완료")} {...mediaItemActions} rotate={rotate} />
    <Stack gap="sm"><Text variant="caption" tone="muted">가상화 목록의 항목 칸</Text><MediaSelectionCell item={items[1]!} index={1} count={items.length} {...mediaItemActions} rotate={rotate} /></Stack>
  </Stack>;
}

export function ProfileScreenPreview() {
  return <ProfileScreen title="프로필" summary={<Text as="p">요약</Text>} edit={action("편집")} />;
}

export function ChatMessagePreview() {
  return <Stack gap="md">
    <ChatMessage direction="incoming" author="서연" timestamp="지금">안녕하세요</ChatMessage>
    {/* 2026-10-18 mediaAlbum: renderPage runs only for the shown photo, so a product can fetch one image at a time. */}
    <ChatMessage direction="incoming" author="서연" timestamp="지금" mediaAlbum={photoAlbum}>{null}</ChatMessage>
  </Stack>;
}

export function NotificationRowPreview() {
  return <NotificationRow preview={<Text as="span">새 답글이 달렸어요</Text>} metadata="방금" avatar={<span aria-hidden="true">S</span>} />;
}

export function NotificationItemPreview() {
  return <NotificationItem title="답글" read={false} statusLabel="읽지 않음" timestamp="방금" />;
}

const photoAlbum = { count: 3, renderPage: (index: number) => <PreviewPhoto index={index} square label="" />, pageLabel: (index: number, count: number) => `사진 ${index + 1}/${count}`, previousLabel: "이전 사진", nextLabel: "다음 사진" };
// 2026-10-18: a rich (non-text) body can move the time under it, a paged album loads one photo, and an inline
// panel (edit/report/block form) sits under the Reply line outside the long-press target.
export function CommentThreadRowPreview() {
  const [reporting, setReporting] = useState(false);
  return <Stack gap="lg">
    <CommentThreadRow item={comments[0]!} onLike={noop} onReply={noop} replyLabel="답글" />
    <CommentThreadRow item={{ ...comments[0]!, id: "c2", body: <span aria-label="분홍 꽃 도장" style={{ fontSize: 28 }}>🌸</span>, timeLabel: "3분 전", timePlacement: "actions", mediaAlbum: photoAlbum, actions: <Button size="small" tone="ghost" onClick={() => setReporting(open => !open)}>신고</Button>, ...(reporting ? { panel: <Stack gap="xs"><Text>신고 사유를 골라 주세요</Text><Button size="small" tone="secondary" onClick={() => setReporting(false)}>닫기</Button></Stack> } : {}) }} onLike={noop} onReply={noop} replyLabel="답글" />
  </Stack>;
}

export function ProfileSummaryPreview() {
  return <ProfileSummary name="서연" avatar={<span aria-hidden="true">S</span>} />;
}

export function IconTilePreview() {
  // Default frame, then the 2026-10-18 frame options: complete artwork without a frame, a theme shape, a filling icon.
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 76px)", gap: 16, alignItems: "start" }}>
    <IconTile icon={<span aria-hidden="true">★</span>} label="도구" />
    <IconTile frame="none" icon={<span aria-hidden="true" style={{ display: "grid", placeItems: "center", inlineSize: 64, blockSize: 64, borderRadius: 14, background: "var(--hjm-color-content-brand)", color: "var(--hjm-color-on-primary)" }}>★</span>} label="틀 없음" />
    <IconTile shape="square" icon={<span aria-hidden="true">■</span>} label="사각형" />
    <IconTile shape="circle" size="fill" icon={<span aria-hidden="true">●</span>} label="칸 채움" />
  </div>;
}

export function TypingIndicatorPreview() {
  return <Stack gap="sm">
    <ChatMessage direction="incoming" author="서연" timestamp="오후 3:01">곧 도착해요</ChatMessage>
    <TypingIndicator label="서연님이 입력 중" />
  </Stack>;
}

export function ChatDateSeparatorPreview() {
  return <div>
    <ChatDateSeparator label="10월 18일 토요일" dateTime="2026-10-18" />
    <ChatMessage direction="incoming" author="서연" timestamp="오전 9:12">좋은 아침이에요</ChatMessage>
  </div>;
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
