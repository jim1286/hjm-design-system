# Pagination contract

## 문제

경계가 있는 결과 집합(검색 결과, 관리자 테이블)에서 사용자가 임의의 페이지로
바로 이동할 수 있어야 한다. 이는 계속 스크롤해서 다음 항목을 불러오는 열린
목록과는 다른 문제다.

## Pagination과 LoadMore의 경계 (로드맵이 이미 그은 선)

`docs/expansion-roadmap.md`는 이미 명시한다: "Native 긴 목록에는 페이지 번호
보다 LoadMore/infinite loading을 사용한다." 그래서 Pagination은 `platform:
web` 전용이고 LoadMore(`shared`)는 두 플랫폼 다 있다. 이유는 표면적
"페이지 번호 vs 무한 스크롤" 취향이 아니라 총량과 입력 장치의 차이다.

- Pagination은 **안정된 총 개수/총 페이지**를 전제한다 — 사용자가 "42페이지로
  가겠다"는 의도를 표현할 수 있는 자리다.
- LoadMore는 **총량을 몰라도** 되고, 사용자는 "다음 조금 더"만 의도한다 —
  `LoadMoreState`에 `totalPages` 개념 자체가 없다.
- 마우스/키보드가 있는 Web에서는 임의 페이지 클릭이 싸다. 터치로 스크롤하는
  Native 긴 목록에서는 페이지 번호 탭이 스크롤 관성과 경쟁하고, 오차 없이
  작은 숫자를 누르기도 어렵다.

두 계약은 서로를 참조하지 않는다(`src/load-more.ts`는 Pagination을 모르고
반대도 마찬가지). 제품이 고르는 기준은 이 문서에 있다: **총량이 고정되고
사용자가 임의 페이지로 점프해야 하면 Pagination, 그렇지 않고 계속 이어지는
피드면 LoadMore.** 같은 화면에 두 계약을 동시에 쓸 이유는 없다 — 하나의
목록은 둘 중 하나의 탐색 모델만 가진다.

## 일반화한 계약

### 필수 입력

`PaginationDescriptor`는 `currentPage`와, 총량을 표현하는 두 형태 중
정확히 하나를 받는 discriminated union이다.

- `{ currentPage, totalCount, pageSize }` — 제품이 원본 개수와 페이지 크기를
  아는 가장 흔한 경우. `totalPages = max(1, ceil(totalCount / pageSize))`로
  유도한다.
- `{ currentPage, totalPages }` — 서버가 이미 페이지 수 단위로 응답하거나
  페이지 크기 개념이 없는 경우.

`totalPages`와 `totalCount`/`pageSize`를 동시에 주거나 아무것도 안 주면
validator가 `TypeError`로 거부한다. `currentPage`가 유도된 `totalPages`
범위를 벗어나면 `RangeError`로 거부한다 — 조용히 clamp하지 않는다(브리프:
"validator는 던진다").

### 배제한 것 — size changer와 jump-to-page

**페이지 크기 변경(size changer)과 "몇 페이지로 이동" 입력은 넣지 않는다.**
둘 다 antd `Pagination`에는 있지만:

- 측정된 제품 수요가 없다 — 로드맵의 어떤 vertical slice도 이 두 기능을
  요구한 적이 없다.
- 둘 다 이미 있는 `currentPage`/`totalPages` 상태에 도달하는 **또 다른
  경로**일 뿐 새 상태 축이 아니다. size changer는 제품이 `pageSize`를 바꿔서
  같은 `PaginationDescriptor`를 다시 넘기면 되고, jump-to-page는 별도
  `NumberField` + 제품 코드가 같은 `onPageChange(page, "page")`를 호출하면
  된다. 이 모듈이 그 UI를 대신 만들 필요가 없다.

필요해지면 그때 이 문서를 갱신하고 여는 것이 맞다 — 지금은 그 증거가 없다
(Dropdown/Notification 문서와 같은 원칙).

### 페이지 번호 목록은 순수 함수다

`computePaginationItems(totalPages, currentPage, { siblingCount,
boundaryCount })`는 접근성 이름 조립과 완전히 분리된 순수 함수다. 항상
보여야 하는 페이지(양쪽 경계 `boundaryCount`개 + `currentPage` 주변
`siblingCount`개)의 합집합을 구하고, 그 사이 숨는 페이지 수에 따라:

- 숨는 페이지가 **정확히 1개**면 그 번호를 그대로 보여준다 — `...`이 숫자
  하나보다 자리를 아끼지 않으므로 생략할 이유가 없다.
- 숨는 페이지가 **2개 이상**이면 생략 표시 하나로 접는다.

경계 입력을 테스트로 잠갔다: 총 1페이지(생략 없음, 번호 하나), 총 2페이지
(생략 없음, 둘 다 표시), 현재가 첫 페이지(꼬리만 접힘), 현재가 마지막 페이지
(머리만 접힘), 숨는 페이지가 정확히 1개인 경우(생략 대신 번호), 1~14페이지
전 조합에 대한 "연속 생략 없음 / 항상 1과 totalPages로 시작·끝남" 불변식.

### 접근성 이름은 제품이 조립한다

`ComposePaginationAccessibleName`은 `steps.ts`의 `composeAccessibleName`
선례를 그대로 따른다 — `{ page, totalPages, current }`를 받아 "5 페이지 중 3
페이지" 같은 문장을 제품이 조립해 각 페이지 버튼의 accessible name으로 쓴다.
Steps와 같은 이유다: 순서를 나타내는 문장의 어순과 조사는 언어마다 다르고
(한국어 "5 페이지 중 3 페이지"는 영어 "page 3 of 5"와 구조가 다르다), 생략
표시로 페이지가 듬성듬성 보이는 상황에서는 화면에 찍힌 숫자 하나만으로
전체 맥락(총 몇 페이지 중인지)이 전달되지 않는다. resolver는 composer가 빈
문자열을 반환하면 던진다.

생략 표시(`...`)는 **장식**이다. `ResolvedPaginationItem`의 ellipsis 분기는
`accessibleName` 필드 자체가 없다 — 렌더러가 `aria-hidden`으로 완전히 숨겨야
하고, 페이지 버튼과 달리 focus를 받지 않는다.

## HJM 기본값

- `siblingCount: 1`, `boundaryCount: 1` — 현재 페이지 양옆 1개, 양쪽 경계
  1개씩만 항상 보인다. antd 기본값을 복사한 것이 아니라 가장 흔한 폭(모바일
  전체 폭 웹뷰~데스크톱 사이드바)에서 항목 수가 과도하게 늘어나지 않는
  선에서 고른 값이다. 더 넓은 화면이 필요하면 제품이 두 값을 올린다.
- 현재 페이지 표시는 `identity.md`의 "primary fill은 주요 행동에, 더 밝은
  contentBrand는 focus·선택 indicator·현재 위치에" 원칙과 `stepsRecipe`의
  현재 단계 처리(배경 채우지 않고 border+글자색만 brand)를 그대로 따른다.
  `paginationRecipe.item`은 현재 페이지에 `action.brand` 채움을 쓰지 않고
  `border.focus`/`content.brand` 외곽선만 쓴다 — 페이지 번호는 위치 표시이지
  버튼 커맨드가 아니다.
- 이전/다음 아이콘은 새 glyph를 만들지 않고 기존 논리 방향 아이콘
  `chevronStart`/`chevronEnd`(RTL에서 자동 mirror)를 재사용한다. 생략 표시의
  장식 마크도 기존 `more` 아이콘을 재사용한다.

## 플랫폼 번역

- Web: root는 `<nav>` 랜드마크다. 각 페이지 버튼은 `aria-current="page"`를
  현재 페이지에만 달고, 시각 숫자와 함께 제품이 조립한 `accessibleName`을
  accessible name으로 쓴다. 생략 표시는 `aria-hidden`이며 tabbable하지 않다.
  이전/다음 버튼은 `PaginationLabels`의 고정 현지화 문구를 쓰고, 경계에서는
  `disabled`(색만이 아니라 `aria-disabled`와 `opacity.disabled`)로 표시한다.
- Native: `platform: web`이므로 이 계약은 Native 렌더러를 갖지 않는다 —
  긴 목록의 Native 대응은 `LoadMore`다(위 경계 참고).
- Reduce Motion: 페이지 전환은 이동 애니메이션 없이 콘텐츠만 교체한다 —
  Pagination 자체는 전환 모션을 소유하지 않는다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `currentPage`, `totalPages`(또는 `totalCount`+`pageSize`) | 공개(필수) |
| 페이지 window 크기(`siblingCount`/`boundaryCount`) | 공개(선택, 기본값 있음) |
| 생략 표시 | 공개하되 장식으로 한정 — 낭독 제외 |
| page size changer | **배제** — 측정된 수요 없음, 필요 시 제품이 같은 상태를 다시 넘기는 방식으로 조합 가능 |
| "몇 페이지로 이동" 입력 | **배제** — 위와 같은 이유, 별도 `NumberField` + `onPageChange`로 조합 가능 |
| `disabled`(컨트롤 전체) | **배제** — 브리프가 요구한 필수 계약을 넘는 축이라 지금은 열지 않는다. 필요해지면 availability 축에서 `enabled`/`disabled`만 추가한다 |
| Native 대응 | **배제** — `LoadMore`가 이미 같은 문제의 Native 해法이다 |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가
진행한다(로드맵 maturity gate). 유력 후보는 검색 결과나 관리자 테이블처럼
안정된 총 개수가 있는 Web 목록이다.
