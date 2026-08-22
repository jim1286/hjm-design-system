# Result contract

**문제.** 흐름이 끝나는 화면 — 결제 성공, 제출 실패, 존재하지 않는 페이지 — 을 하나의
상태와 최대 두 개의 다음 행동으로 보여줍니다.

**일반화한 계약.**

```ts
const saved = {
  status: "success",
  title: "저장했어요",
  description: "변경 사항을 반영했습니다.",
  actions: [{ label: "홈으로", onAction: goHome }],
} satisfies ResultDescriptor;
```

- `status`는 `success | failure | info` 세 가지로 좁힙니다. Ant Design `Result`의
  403/404/500은 Web 페이지 개념이지 플랫폼 중립 상태가 아닙니다 — adapter가 이런 HTTP
  의미를 `failure`로 번역하고, 실제 문구("페이지를 찾을 수 없어요")는 제품이 `title`/
  `description`에 직접 채웁니다.
- `actions`는 최대 두 개입니다. 첫 번째가 primary, 두 번째가 secondary입니다.
  **셋 이상은 validator가 거부합니다** — 조용히 세 번째를 잘라내면 화면 작성자가 잘렸다는
  사실을 못 보고 넘어가기 때문입니다.
- 각 action은 `label`과 `onAction`이 필수입니다. `accessibilityLabel`이 없으면 resolver가
  `label`로 채웁니다.

## EmptyState와의 경계

이 시스템에는 이미 `EmptyState`(beta)가 있습니다. 둘 다 "콘텐츠 대신 보여주는 화면"이라는
점은 같지만 의미가 정반대입니다.

- `EmptyState`는 **아직 없음**입니다 — 검색 결과가 없거나 목록이 비었을 뿐, 조건이
  바뀌면 다시 채워질 수 있는 자리입니다. 사용자는 계속 그 화면에 머무르며 필터를
  바꾸거나 새로고침합니다.
- `Result`는 **끝남**입니다 — 이 흐름은 여기서 종료되었고, 다음 행동은 이 화면에
  머무르는 것이 아니라 다른 곳으로 이동하거나 다시 시도하는 것입니다.

그래서 `Result`만 `status`(success/failure/info) tone 축을 가지고 `resultRecipe.tones`가
성공/실패/정보를 시각적으로 구분합니다. `EmptyState`는 상태 tone이 없고 아이콘이 항상
`semanticColors.content.decorative`로 중립인 채입니다 — "아직 없음"은 성공도 실패도
아니기 때문입니다. 반대로 `Result`는 항상 하나의 명확한 tone을 요구합니다(`status`가
필수 필드입니다).

### 실측 — 흡수는 아니지만, 위 근거 중 하나는 실물과 어긋난다

`planned → beta` 실측 과정에서 "Result가 EmptyState에 흡수된 것 아닌가"라는 질문이
나왔다. 야잘알의 `ErrorFallback`(`app/_layout.tsx:142-166`, 크래시 바운더리)과
`PlayerScreen`의 로드 실패 화면(`features/player/PlayerScreen.tsx:44-99`) 둘 다 별도
컴포넌트 없이 `AppStateView`가 `AppEmptyState`의 아이콘만 바꿔 렌더링하기 때문이다.
직접 코드를 읽고 두 가지를 확인했다.

1. **Result가 실제로 가리키는 문제(결제 성공, 제출 실패처럼 사용자 행동 뒤에 오는
   flow terminus)는 두 제품 어디에도 없다.** 위 두 화면은 사용자 행동의 결과가 아니라
   **데이터를 못 불러왔다**는 상태다 — `PlayerScreenProps.status`가
   `'loading'|'error'|'empty'|'success'`인 것에서 보이듯, 이건 `docs/expansion-roadmap.md`
   「공통 상태 축」의 `content` 축(idle/loading/loadingMore/empty/error)을 화면 전체
   또는 구역 단위로 렌더링한 것이다. BurnTok의 유일한 "생성 성공/실패" 후보
   (`apps/web/src/app/create/page.tsx`의 `Phase`)도 재확인해 보니 성공은 실제 생성물
   미리보기를, 실패는 인라인 문장 하나를 보여줄 뿐 — 추상적 아이콘+제목+행동 화면이
   아니다. 즉 Result의 정의가 가리키는 화면 자체가 아직 어느 제품에도 없다.
2. **"EmptyState는 tone이 없다"는 근거는 실물과 다르다.** `AppStateView`/
   `AppStateRegion`(`components/ui/AppStateView.tsx`, `AppStateRegion.tsx`)은 이미
   `error`에 `colors.danger`(또는 `tone="danger"`) 아이콘을, `empty`에 중립 아이콘을
   각각 고정 배정한다 — "아이콘이 항상 decorative로 중립"은 지금 이 계약 초안
   (`emptyStateRecipe`, tone 필드 없음)에는 맞지만 실제 제품 구현에는 맞지 않는다.

   그런데 이 사실이 "그러니 EmptyState에 tone을 추가하고 Result를 흡수시켜라"로
   이어지지는 않는다. 실제 제품이 **진짜로** 가르는 축은 success/failure/info라는
   결과의 종류가 아니라 **"이 실패가 화면 전체를 막는가, 일부만 막는가"**
   (`AppStateView`=전체, 유일한 출구, 채움 버튼 / `AppStateRegion`=구역, 복구는 선택지
   중 하나, ghost 버튼 — 코드 주석이 "§6 오류 복구 행동"을 직접 인용해 이 구분을
   설명한다)다. 이 축은 `Result`의 `status`와도, `EmptyState`의 (없는) tone과도
   무관하다 — 둘 중 어느 계약도 지금 이 축을 갖고 있지 않다.

**판정: 흡수됨이 아니다.** Result가 푸는 문제(사용자 행동 뒤의 flow terminus)와
EmptyState가 지금 실제로 쓰이는 문제(전체/구역 단위 load-state 렌더링)는 서로 다르다 —
겹쳐 보인 이유는 두 계약 다 vertical slice가 아직 없어서 같은 화면(데이터 로드 실패)에
동원됐을 뿐이다. `docs/ant-design-coverage.md`의 「만들지 않는다 세 종류」 표 기준으로는
Result·EmptyState 둘 다 **"검증할 화면이 없음"**(계약은 유효하나 확인할 화면이 없음)
범주에 남아야 하고, catalog 행도 그대로 둔다. 다만 이 조사에서 나온 "전체 화면 vs
구역" 축은 실제로 관측된 요구라 다음에 Result를 다시 다룰 저작자에게 남겨 둔다 —
Result 자체의 축으로 넣을지, 별도 계약(예: 로드 상태 렌더러의 scope)으로 둘지는 이
문서가 결정하지 않는다.

## 플랫폼 번역

Web/Native 모두 아이콘 + 제목 + 설명 + action 슬롯을 세로로 쌓습니다. `primaryAction`/
`secondaryAction`은 이 계약이 스타일을 소유하지 않고 기존 `Button`/`Link` 컴포넌트를
그대로 조합합니다 — Result 자체의 recipe는 아이콘 tone, 타이포그래피 위계, 슬롯 사이
gap만 제공합니다.

## 검증 화면 (예정)

야잘알 결제/제출 흐름의 성공·실패 화면을 첫 vertical slice 후보로 남깁니다.
`planned → beta` 승격에는 primary-only, primary+secondary, action-없음 세 조합의 실제
화면 검증이 포함되어야 합니다.
