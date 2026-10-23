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

## trailing accessory (2026-10-23, 개발 소스·미게시)

`trailingAccessory="disclosure"`는 행이 다른 화면으로 이동한다는 의미 축이다. 모양(`chevronEnd`·`glyph.sm`·`content.decorative`·Icon `regular`)과
간격(trailing 값 뒤 `spacing.xs`)은 `listRowRecipe.accessories`가, 순서(content → trailing → accessory → `trailingAction`)는 두 renderer가 같게 지킨다.
장식이라 Web은 `aria-hidden`, Native는 보조기기에서 숨기며 행 이름에 더하지 않는다. RTL에서는 읽기 방향 끝을 가리킨다.
기존 API로는 `trailing`에 Icon을 넣는 방법뿐이었고, 제품마다 크기·색·RTL·값과의 간격이 달라졌다(야잘알 10·유틸버스 24·spint 3곳 감사).
사용법은 [사용 지침](usage/components/list-row.md)을 따른다.
