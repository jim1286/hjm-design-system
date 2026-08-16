# LoadMore contract

`LoadMore`는 목록 데이터나 cursor를 소유하지 않습니다. 이미 렌더된 항목을 유지한 채 다음
페이지 요청의 footer 상태와 중복 요청 방지만 공통화합니다.

```text
ready(requestKey) ─ request ─→ loading(requestKey)
        ↑                         ├─ success + next key → ready
        ├──── retry ← error ←─────┤
        └──────────── complete ←──┘
```

- `requestKey`는 cursor나 offset을 제품 adapter가 stable string으로 만든 값입니다.
- `labels`는 load more/loading/retry/complete 네 상태의 현지화된 visible copy입니다. renderer가
  자체 문구나 영어 fallback을 만들지 않습니다.
- `createLoadMoreController`는 한 controller에서 요청 하나만 허용합니다. 같은 sentinel의 반복
  노출이나 RN `onEndReached` 중복 호출이 query를 두 번 실행하지 못합니다.
- `automatic` mode는 viewport sentinel을 사용할 수 있지만, keyboard와 screen reader 사용자를
  위한 manual fallback button을 함께 렌더링합니다. `manual` mode는 viewport 요청을 무시합니다.
- `ready`는 manual/viewport, `error`는 retry reason만 허용합니다. `loading`과 `complete`는 모든
  요청을 차단합니다.
- `onLoadMore`는 실제 query가 끝날 때 settle되는 Promise를 반드시 반환합니다. detached 요청이나
  `void fetchNextPage()`는 gate를 조기에 풀어 같은 cursor가 중복 실행될 수 있어 거부합니다.
  query promise가 성공하거나 실패하면 gate가 풀립니다. 오류 copy와 retry 상태는 제품 query가
  소유하며, 기존 collection item을 숨기지 않습니다.
- loading copy는 status로, 오류는 alert로 한 번만 발표합니다. retry/manual target은 44-unit
  이상이고 focus indicator를 유지합니다.

Web `IntersectionObserver`와 RN `onEndReached`는 감지 방식만 다르며 같은 controller와 state를
사용합니다. 페이지 번호가 필요한 탐색은 `Pagination`, 사용자 의도 없이 계속 이어지는 긴
목록은 `LoadMore`로 분리합니다.
