# VirtualList — 계약을 만들지 않는다

## 제약

`docs/ant-design-coverage.md`의 lifecycle 절이 이미 선언했다 — Ant Design 6.6.0이 기존
`List`를 deprecated로 두고 `Listy`를 successor로 추가했지만, **HJM은 기존 비가상
`List`와 planned `VirtualList`를 서로 다른 사용 문제로 유지한다.** 이 문서는 그 선언을
뒤집지 않는다. 두 catalog row(`List` beta, `VirtualList` planned + `aliases: ["Listy"]`)를
합치자는 이야기가 아니라, **`VirtualList`가 소유할 계약이 실제로 있는지**를 판정한다.

## 판정: 지금은 아무것도 소유하지 않는다

가상화가 계약이 되려면 "Web과 Native가 각자 다른 구현 기법으로 같은 결과를 낸다"는
공통 semantic이 있어야 한다(`docs/architecture.md`의 `adaptive` 정의 그대로). 후보를
셋으로 나눠 각각 판정했다.

### 1. 항목 높이 추정(고정/가변) — 렌더러 기법이다

Web windowing 라이브러리(react-window/virtua류)와 RN `FlatList`는 각자의 windowing
파라미터(`itemSize`/`overscan` vs `getItemLayout`/`windowSize`/`initialNumToRender`)를
갖지만 이름도, 단위도, 의미도 서로 대응하지 않는다. Slider의 `min`/`max`/`step`처럼
두 플랫폼이 같은 사용자 의미를 공유하는 것이 아니라, 각 플랫폼의 렌더링 성능 엔진이
내부적으로 요구하는 힌트일 뿐이다 — 공유할 semantic이 없다.

### 2. 스크롤 위치 복원 — 가상화 전용 문제가 아니다

가상화하지 않은 평범한 긴 목록도 스크롤 위치 복원이 필요하다(뒤로가기 후 원래 보던
위치로). 이 문제는 "가상화됐는가"와 독립이고, 스크롤을 소유한 컨테이너/렌더러의 몫이다
— `VirtualList`라는 이름 아래 있어야 할 이유가 없다.

### 3. 총 개수의 낭독 — 실제로는 이미 있거나, 아직 없다

가상화된 목록은 DOM/네이티브 뷰 트리에 일부만 마운트되므로 스크린 리더가 전체 개수를
잘못 알 수 있다는 우려는 진짜다. 그런데 이 문제를 나눠보면:

- 전체 데이터가 이미 메모리에 있는 경우(`items.length`를 제품이 이미 안다) — 총
  개수는 이미 알려진 값이고, `aria-setsize`/`aria-posinset`류를 실제 배열 길이로
  채우는 것은 렌더러가 창을 마운트할 때 하는 일이다. 이걸 계산하거나 유도할 판단이
  없다 — Steps/Timeline/Carousel의 `position`/`total`처럼 커서 위치나 유효하지 않은
  조합을 막는 로직이 있는 게 아니라, 그냥 `.length`를 읽는 일이다.
- 전체 데이터가 아직 로딩 중인 경우(페이지네이션) — 이건 `src/load-more.ts`가 이미
  소유한 문제다. `LoadMoreState`는 의도적으로 `totalCount`를 갖지 않는다 — 모르는
  총합을 지어내는 것이 아무것도 말하지 않는 것보다 나쁘기 때문이다(`idle|loading|
  loadingMore|error|complete` 중 어느 것도 총 개수를 전제하지 않는다). `VirtualList`가
  이 자리에 총 개수 축을 새로 만들면 LoadMore가 이미 내린 판단과 충돌한다.

즉 이 문제는 이미 있는 계약(`LoadMore`) 또는 렌더러가 이미 아는 값(`items.length`) 중
하나로 항상 환원된다 — `VirtualList`가 따로 소유할 몫이 남지 않는다.

## 결론

측정된 제품 요구도 없다 — 로드맵·메모리 어디에도 "List+LoadMore로는 렌더링 성능이
부족했다"는 vertical slice 기록이 없다. 야잘알의 긴 목록(팀 순위, 선수 검색 결과)은
이미 List/ListRow + LoadMore 조합으로 충분히 설계돼 있다.

`src/virtual-list.ts`, `test/virtual-list.test.ts`는 만들지 않는다. catalog row(`{ name:
"VirtualList", category: "data-display", platform: "adaptive", status: "planned",
aliases: ["Listy"] }`)는 건드리지 않는다 — 이름 자리를 지우자는 것이 아니라, 지금
채울 계약이 없다는 것이다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 이 판정을 다시 연다.

1. 실제 제품에서 List+LoadMore로 렌더링 성능(프레임 드랍, 초기 마운트 시간)이 측정
   가능하게 부족한 vertical slice가 나온다.
2. Web과 Native 렌더러가 **같은 이름의 파라미터**로 반응하는 windowing 설정이 두
   플랫폼 모두에서 검증돼, 진짜 공유 semantic이 있다고 판단된다.
3. 총 개수를 알 수 없는 채로 가상화해야 하는 화면이 나와, `LoadMore`의 "총합을 지어내지
   않는다"는 원칙과 다른 새 발화 규칙이 필요해진다.
