# ListDetailScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 (별도 보조 기능) · 검토일: 2026-10-06 ·
계약: [Screen patterns — 기본 흐름 공개 조합](../screen-patterns.md#기본-흐름-공개-조합-2026-10-05)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ListDetailScreen` | `/screen-flows` | `/screen-flows` | 목록 유지 + 상세 전환 화면 |

granular subpath로만 import 된다(루트 entry에 없음). 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { ListDetailScreen } from "@hjmds/react/screen-flows";

<ListDetailScreen
  title={t("orders.title")}
  list={<List label={t("orders.list")}>{rows}</List>}
  detail={selected ? { title: selected.name, content: <OrderDetail order={selected} /> } : undefined}
  back={{ label: t("common.back"), onAction: () => setSelected(null) }}
  refresh={{ label: t("common.refresh"), onAction: refetch, pending: isRefetching }}
/>
```

```tsx
// Native
import { ListDetailScreen } from "@hjmds/react-native/screen-flows";

<ListDetailScreen title={t("orders.title")} list={orderList}
  detail={detail} back={{ label: t("common.back"), onAction: closeDetail }}
  loadMore={{ label: t("orders.more"), onAction: fetchNext, pending: isFetchingNext }} />
```

## 축과 기본값

- `list`(필수), `back`(필수), `detail?: { title, content }`. `detail`이 있으면 상세 pane을 보이고 목록 pane을 숨긴다.
- 행동(`back`·`refresh`·`loadMore`)은 `{ label, onAction, disabled?, pending? }`. `pending`이면 버튼이 loading·비활성이 된다.
- `refresh`는 목록 화면 `actions` 자리에, `loadMore`는 목록 화면 footer에 ghost 버튼으로 그린다.
- 나머지는 [ScreenLayout](screen-layout.md) prop(`title` 필수, `description`, `leading`, `notice`, `state`, `scroll` 등)이며 목록 pane에 적용된다.

## 꼭 지킬 것

- 라벨은 모두 i18n 키로 넣는다.
- `state`(로딩·빈·오류·제한)는 목록 pane에만 적용된다. 상세의 로딩·오류는 `detail.content` 안에서 표시한다.
- 상세 열림 상태는 제품이 가진다. OS 뒤로가기·브라우저 뒤로가기와 `back`을 제품 router에서 함께 연결한다.

## 함정

- `refresh`를 주면 ScreenLayout `actions`는 무시된다. 둘 다 필요하면 `refresh` 대신 `actions`에 직접 조합한다.
- 상세 pane은 `title`과 `back`(leading)만 받는다. 상세 쪽 `description`·`actions`·footer 자리는 없다.
- `loadMore`는 상태 없는 버튼이다. 끝·오류·중복 요청 방지가 필요하면 LoadMore를 쓴다.
