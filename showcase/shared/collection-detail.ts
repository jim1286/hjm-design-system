export type CollectionDetailProps = { empty?: boolean };
export const collectionRecords = [
  { id: "walk", label: "산책", description: "공원에서 발견한 작은 풍경을 남겼어요." },
  { id: "read", label: "독서", description: "다시 읽고 싶은 문장을 모았어요." },
  { id: "rest", label: "휴식", description: "조용히 쉬어가는 시간을 기록했어요." },
  { id: "cook", label: "요리", description: "직접 만든 한 끼의 기억을 남겼어요." },
  { id: "travel", label: "여행", description: "처음 방문한 곳의 이야기를 적었어요." },
] as const;
export const collectionCopy = {
  title: "카드 탐색과 상세", description: "여러 기록을 함께 읽고 옆으로 탐색해요. 입력과 상세 보기를 독립적으로 유지해요.",
  list: "기록 모음", previous: "이전 기록", next: "다음 기록", navigation: "기록 탐색",
  open: "상세 보기", close: "닫기", note: "기록 메모", detailNote: "상세 메모", initial: "이어서 쓸 메모",
  empty: "아직 기록이 없어요.", fixture: "합성 기록 예제예요. 서버 조회·저장은 제품에서 연결해요.",
} as const;
