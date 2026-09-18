# ListRow contract

## loading rows (2026-09-18)

`loading`은 실제 행과 **같은 높이와 슬롯 기하**를 잡는 자리표시 행이다.

제품이 목록 옆에 따로 만든 skeleton(Diairy `LoadingSkeleton`, BurnTok `FeedCardSkeleton`)은
행의 실제 높이를 모른다. 그래서 내용이 도착하면 목록이 튄다. 자리표시가 같은 컴포넌트
안에 있어야 title/description의 **line box**를 그대로 예약할 수 있다.

- 넘기는 슬롯의 *존재*가 모양을 정한다. 문구 자체는 무시되므로 실제 행과 같은 슬롯을
  주면 된다.
- 로딩 행은 상호작용하지 않는다 — 아직 활성화할 것이 없다.
- `role="status"` + `aria-busy`로 알리고, 문구(`loadingLabel`)는 제품이 현지화한다.
