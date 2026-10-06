# SortableCollection 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 (별도 보조 기능, supplemental) · 검토일: 2026-10-06 ·
계약 함수: `@hjmds/design-contracts/components/interaction-adapters`

## 언제 쓰나

작은 목록의 순서를 사용자가 바꾸고, 그 순서를 제품이 저장할 때 쓴다(즐겨찾기 순서, 할 일 순서 등).
드래그와 함께 각 행에 "앞으로/뒤로" 버튼과 키보드·접근성 action이 항상 붙는다. 목록은 제품이 controlled로 쥔다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 순서를 바꾸지 않는 일반 목록 | [List](list.md), [ListRow](list-row.md) |
| 행을 밀어 나오는 행동(삭제·보관) | [SwipeActions](swipe-actions.md) |
| 두 목록 사이로 항목 옮기기 | [TransferList](transfer-list.md) |
| 수백 개 이상의 긴 목록 | [VirtualList](virtual-list.md)(정렬 기능 없음) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SortableCollection` | `/sortable`만 | `/sortable`만 | 별도 보조 기능 |

root·category entry에서는 export되지 않는다. granular subpath로만 import한다.
이 subpath는 optional peer를 앱이 직접 설치해야 동작한다.

| renderer | 필요한 peer(정확한 버전) |
| --- | --- |
| Web | `@dnd-kit/react` 0.5.0, `@dnd-kit/dom` 0.5.0 |
| Native | `react-native-sortables` 1.10.1, 그리고 그 peer인 `react-native-gesture-handler`·`react-native-reanimated`(HJM peer 범위: gesture-handler 2.32.0, reanimated ^4.5.1, 함께 선언된 `react-native-worklets` ^0.10.1) |

다른 optional subpath(celebration·qr-code 등)에서 peer 없이 tsc·테스트는 통과하고 기기 Metro에서
크래시한 사고가 있었다(2026-10). 설치 여부를 기기 실행으로 확인한다.

## 최소 사용 예

```tsx
// Web
import { SortableCollection } from "@hjmds/react/sortable";

<SortableCollection
  label={t("favorites.orderLabel")}
  items={favorites.map((f) => ({ id: f.id, label: f.name }))}
  labels={sortLabels}
  renderItem={(item) => <FavoriteSummary id={item.id} />}
  onCommit={(intent) => saveOrder(intent.orderedIds)}
/>
```

```tsx
// Native
import { SortableCollection } from "@hjmds/react-native/sortable";

<SortableCollection
  label={t("favorites.orderLabel")}
  items={items}
  labels={sortLabels}
  renderItem={(item) => <FavoriteSummary id={item.id} />}
  onCommit={(intent) => saveOrder(intent.orderedIds)}
  active={isFocused}
/>
```

`labels`(`SortableLabels`)는 모두 제품 i18n 문구다: `instructions`, `dragStart(item)`, `dragCancel`,
`handle(item)`, `previous(item)`, `next(item)`, `position(item, position, total)`.

## 꼭 지킬 것

- `items`는 고유하고 비지 않은 `id`와 번역된 `label`을 가져야 한다. 어기거나 `label`이 비면 `TypeError`를 던진다.
- `onCommit`이 받은 `ReorderIntent.orderedIds`로 제품 상태를 갱신해야 화면 순서가 바뀐다. 저장·실패 시 되돌리기는 제품 소유다.
- `item.disabled`인 항목은 그 자리에 고정된다. 그 항목을 가로지르는 이동은 거절된다.
- 같은 목록이 드래그 중 바뀌면 드래그를 취소하고 `onCancel`을 부른다.
- 스타일 prop(`style`/`className`)은 없다. 행 모양·핸들·이동 버튼은 HJM 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 엔진 | `@dnd-kit` | `react-native-sortables` 1열 Grid |
| `active` prop | 없음 | 있음. 탭 이동 뒤에도 마운트가 남는 화면은 route focus를 넘긴다 |
| 이동 알림 | `role="status"` 영역에 `position` 문구 | `announceForAccessibility` |
| reduced motion | 전환 애니메이션만 끈다 | 드래그 자체를 끈다(버튼·접근성 action으로만 이동) |
| 앱 백그라운드 전환 | 해당 없음 | 드래그 취소(`onCancel`) 후 엔진 상태 초기화 |

## 함정

- `onCancel`은 Web에서 거절된 드래그·취소된 드래그 모두에 온다. 드래그 시작 시 띄운 제품 UI는 여기서 정리한다.
