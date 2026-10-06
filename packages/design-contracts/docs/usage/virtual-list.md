# VirtualList 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [VirtualList](../virtual-list.md), 계산 `resolveVirtualWindow`(`src/virtual-list.ts`)

## 언제 쓰나

행 높이가 **모두 같은** 긴 목록(수백~수천 행)을 정해진 높이 안에서 스크롤할 때 쓴다.
Web은 보이는 범위와 앞뒤 overscan만 마운트하고, Native는 `FlatList`에 위임한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 행 높이가 내용·글자 크기에 따라 달라짐, 짧은 목록 | [List](list.md) |
| 다음 페이지를 네트워크에서 가져옴 | [LoadMore](load-more.md)를 목록 아래에 조합 |
| 높이가 다른 카드 격자 | [Masonry](masonry.md) |
| 열·정렬이 있는 표 | [DataTable](data-table.md) |
| 비어 있을 때의 안내 화면 | `empty` 슬롯에 [EmptyState](empty-state.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `VirtualList` | `/virtual-list`만(root 없음) | `/virtual-list`만(root 없음) | 기본 |

## 최소 사용 예

```tsx
// Web
import { VirtualList } from "@hjmds/react/virtual-list";

<VirtualList
  items={contacts}
  keyExtractor={(contact) => contact.id}
  renderItem={(contact) => <ContactRow contact={contact} />}
  rowHeight={56}
  height={480}
  label={t("contacts.listLabel")}
  empty={<EmptyContacts />}
/>
```

```tsx
// Native
import { VirtualList } from "@hjmds/react-native/virtual-list";

<VirtualList
  items={contacts}
  keyExtractor={(contact) => contact.id}
  renderItem={(contact) => <ContactRow contact={contact} />}
  rowHeight={64}
  height={windowHeight - headerHeight}
  label={t("contacts.listLabel")}
/>
```

## 축과 기본값

- 필수: `items`, `keyExtractor`, `renderItem`, `rowHeight`, `height`, `label`. 선택: `empty`, `overscan`(기본 3).
- 두 renderer의 Props 타입이 같다. `style`·`className`·`layoutStyle`은 없다.

## 꼭 지킬 것

- `label`이 비어 있거나 key가 비었거나 중복이면 `TypeError`를 던진다. key는 데이터의 stable id로 만든다.
- `rowHeight`·`height`는 0보다 큰 유한수, `overscan`은 0 이상 정수다. 아니면 `TypeError`.
- `rowHeight`는 현재 글자 배율에서 행 내용이 들어가는 값으로 제품이 정한다. 행 내용이 넘쳐도 잘리거나 겹칠 뿐
  늘어나지 않는다. 높이를 확정할 수 없으면 List를 쓴다.
- 행 내용·데이터 가져오기는 제품 소유, 창 계산·키보드 탐색은 HJM 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구현 | 직접 창 계산, `role="list"`/`listitem`, `aria-setsize`·`aria-posinset` | `FlatList`(`getItemLayout` 고정) |
| 키보드 | ArrowUp/Down·Home/End로 행 focus 이동, focus된 행은 창 밖에서도 유지 | 없음(보조기술 스크롤은 FlatList 소유) |
| `overscan` | 창 앞뒤 마운트 행 수 | 첫 렌더 행 수(`initialNumToRender`)에만 더함 |
| `label` | 목록의 `aria-label` | `FlatList`의 `accessibilityLabel` |
