# ListDetailScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/콘텐츠/목록과 상세`

## 언제 쓰나

목록 화면에서 한 항목의 상세를 같은 화면 안에서 열고, 뒤로 오면 목록의 입력·스크롤이 그대로 남아야 할 때 쓴다.
목록 pane은 상세가 열려 있는 동안 숨겨질 뿐 mounted 상태를 유지한다. 새로고침·추가 로딩 버튼 자리도 준다.
데이터·페이지 cursor·라우팅은 제품이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 상세가 별도 route·URL이어야 함 | 제품 router + [ScreenLayout](screen-layout.md) 두 화면 |
| 목록만 있는 화면 | [ScreenLayout](screen-layout.md) + [List](list.md) |
| 상태 머신(로딩·오류·끝)이 있는 다음 페이지 footer | [LoadMore](load-more.md)를 `list` 안에 둔다 |
| 넓은 화면에서 목록·상세를 나란히 | [Splitter](splitter.md), [Layout](layout.md) |
| 상세를 화면 위에 띄움 | [Sheet](sheet.md), [SidePanel](side-panel.md) |
| 검색어·필터가 중심인 목록 | [SearchScreen](search-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ListDetailScreen` | 목록 유지 + 상세 전환 화면 | `/screen-flows` | `/screen-flows` |

granular subpath로만 import 된다(루트 entry에 없음). 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { List } from "@hjmds/react/display";
import { ListDetailScreen } from "@hjmds/react/screen-flows";

<ListDetailScreen
  title={t("orders.title")}
  list={<List label={t("orders.list")}>{rows}</List>}
  {...(selected ? { detail: { title: selected.name, content: <OrderDetail order={selected} /> } } : {})}
  back={{ label: t("common.back"), onAction: () => setSelected(null) }}
  refresh={{ label: t("common.refresh"), onAction: refetch, pending: isRefetching }}
/>
```

```tsx
// Native
import { ListDetailScreen } from "@hjmds/react-native/screen-flows";

<ListDetailScreen title={t("orders.title")} list={orderList}
  {...(selected ? { detail: { title: selected.name, content: <OrderDetail order={selected} /> } } : {})}
  back={{ label: t("common.back"), onAction: closeDetail }}
  loadMore={{ label: t("orders.more"), onAction: fetchNext, pending: isFetchingNext }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `list` | `ReactNode` | 필수 | 목록 pane 본문. 상세가 열려도 mount를 유지한다 |
| `detail` | `{ title: string; content: ReactNode }` | 없음 | 있으면 상세 pane을 보이고 목록 pane을 숨긴다. 닫힌 상태는 prop을 빼서 표현한다(`undefined`를 넘기지 않는다) |
| `back` | `ScreenFlowAction`(`{ label, onAction(), disabled?, pending? }`) | 필수 | 상세 pane `leading` 자리의 ghost 버튼 |
| `refresh` | `ScreenFlowAction` | 없음 | 목록 pane `actions` 자리의 ghost 버튼. 주면 `actions`를 덮는다 |
| `loadMore` | `ScreenFlowAction` | 없음 | 목록 pane footer의 ghost 버튼 |
| `layoutStyle` | `HjmCompositionStyleProp` | 없음 | Web·Native 모두 목록·상세 pane을 함께 담는 **바깥 틀**에 적용한다(안쪽 목록 ScreenLayout이 아니다). 목록/상세 전환과 상관없이 같은 루트에 남는다. 미게시(1.12.1 이후) |
| 나머지 | `ScreenLayout`과 같음(`children`·`footer` 제외) | — | 목록 pane에만 적용된다(`title` 필수, `state`, `scroll` 등) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 목록 또는 상세 pane 하나만 표시하고 각 pane이 host 높이 100%(Native `flex: 1`)를 채운다; 각 pane은 ScreenLayout 폭(최대 720) | Web `height: 100%`, Native `Pane` |
| 간격 | 각 pane의 ScreenLayout padding `spacing.md` 16; 추가 간격 없음, 목록 행 간격은 `list`(제품·List) 소유 | `ScreenLayout`, `screen-flows.tsx` |
| 순서·정렬 | 목록 pane: 헤더(제목 → 새로고침) → 목록 → footer(더 보기); 상세 pane: 헤더(뒤로 → 제목) → `detail.content` | `ListDetailScreen` 렌더 순서 |
| 고정·스크롤 | 두 pane 모두 헤더 고정·본문 스크롤; 숨긴 목록 pane은 mount를 유지해 스크롤·입력이 남는다(Web `hidden`, Native `display: "none"`) | Web·Native `ListDetailScreen` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 120 × 글자 배율, 모자라면 새로고침 버튼이 다음 줄로 내려간다; 넓은 폭에서도 두 pane을 나란히 두지 않는다 | `screenPatternRecipe.headerMinWidth` |

## 꼭 지킬 것

- 라벨은 모두 i18n 키로 넣는다.
- `state`(로딩·빈·오류·제한)는 목록 pane에만 적용된다. 상세의 로딩·오류는 `detail.content` 안에서 표시한다.
- Web은 상세 진입 시 뒤로 버튼에 포커스를 옮기고 복귀 시 목록의 원래 요소로 돌린다. 요소가 삭제되었으면 목록 본문으로 이동한다.
  처음부터 `detail`이 있는 채로 mount되면(딥링크) 사용자 전환이 아니므로 포커스를 옮기지 않는다. 그때 포커스는 제품 router가 정한다.
- 상세 열림 상태는 제품이 가진다. OS 뒤로가기·브라우저 뒤로가기와 `back`을 제품 router에서 함께 연결한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `layoutStyle` 적용 위치 | 두 pane을 담는 바깥 `div`(기본 `height: 100%`) | 두 pane을 담는 바깥 `View`(기본 `flex: 1`) |
| 포커스 이동 | 상세 진입·복귀 때 이동, 딥링크 첫 mount는 이동 없음 | 이동하지 않는다 |

## 함정

- `refresh`를 주면 ScreenLayout `actions`는 무시된다. 둘 다 필요하면 `refresh` 대신 `actions`에 직접 조합한다.
- 상세 pane은 `title`과 `back`(leading)만 받는다. 상세 쪽 `description`·`actions`·footer 자리는 없다.
- `loadMore`는 상태 없는 버튼이다. 끝·오류·중복 요청 방지가 필요하면 LoadMore를 쓴다.
