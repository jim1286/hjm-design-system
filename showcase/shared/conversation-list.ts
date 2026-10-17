// Conversation list fixture and copy shared by the Web and Native previews (2026-10-17 S5 review:
// the two previews had diverging copies of rows, menu results and the demo hint).
export type ConversationListAction = "unread" | "mute" | "block" | "delete";
const photo = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&fit=crop`;
export const conversationListRows = [
  { id: "seoyeon", name: "서연", preview: "토요일 2시에 만나요", time: "3분", unread: true, photo: photo("photo-1472396961693-142e6e269027") },
  { id: "walk", name: "산책 모임", preview: "지우: 지난주에 찍은 길이에요", time: "1시간", unread: false, photo: photo("photo-1501785888041-af3ef285b470") },
  { id: "minjun", name: "민준", preview: "사진 고마워요!", time: "어제", unread: false, photo: photo("photo-1441974231531-c6227db76b6e") },
] as const;
export type ConversationListRow = typeof conversationListRows[number];
// Instagram DM order measured 2026-10-16: ordinary actions first, danger actions last.
export const conversationListActions: readonly Readonly<{ id: ConversationListAction; label: string; danger?: boolean }>[] = [
  { id: "unread", label: "읽지 않은 상태로 표시" },
  { id: "mute", label: "알림 해제" },
  { id: "block", label: "차단", danger: true },
  { id: "delete", label: "삭제", danger: true },
];
export const conversationListCopy = {
  title: "메시지",
  compose: "새 메시지",
  search: "대화 검색",
  clearSearch: "검색어 지우기",
  searching: "검색 중",
  noMatch: "찾는 대화가 없어요",
  hint: "행을 길게 누르면 대화 메뉴가 열려요.",
  done: { unread: "읽지 않음으로 표시했어요", mute: "알림을 해제했어요", block: "차단했어요", delete: "대화를 삭제했어요" } satisfies Record<ConversationListAction, string>,
} as const;
export const conversationRowMenuLabel = (row: ConversationListRow) => `${row.name} 대화 메뉴`;
export const conversationRowSummary = (row: ConversationListRow) => `${row.name}, ${row.preview}, ${row.time}${row.unread ? ", 읽지 않음" : ""}`;
export const conversationOpened = (row: ConversationListRow) => `${row.name} 대화를 열어요.`;
export const conversationActionResult = (row: ConversationListRow, id: string) => `${row.name}: ${conversationListCopy.done[id as ConversationListAction]}`;
export const filterConversations = (query: string) => {
  const needle = query.trim();
  return needle ? conversationListRows.filter(row => row.name.includes(needle) || row.preview.includes(needle)) : conversationListRows;
};
