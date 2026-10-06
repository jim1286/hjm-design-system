# VirtualList

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [VirtualList](../../virtual-list.md), 계산 `resolveVirtualWindow`(`src/virtual-list.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/가상 목록`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `VirtualList` | 기본 | `/virtual-list`만(root 없음) | `/virtual-list`만(root 없음) |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `readonly T[]` | — | 필수 |
| `keyExtractor` | `(item: T) => string` | — | 필수. 데이터의 stable id |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | 필수. 행 하나를 그린다 |
| `rowHeight` | 0보다 큰 유한수 | — | 필수. 모든 행의 높이 |
| `height` | 0보다 큰 유한수 | — | 필수. 목록 창 높이 |
| `label` | 문자열 | — | 필수 |
| `empty` | `ReactNode` | — | 선택. `items`가 비었을 때 |
| `overscan` | 0 이상 정수 | 3 | 선택 |
| `layoutStyle`(Web) | `HjmCompositionStyleProp` | — | 목록 창 바깥 배치. Native에는 없다 |

두 renderer의 Props는 Web의 `layoutStyle` 하나만 다르다. `style`·`className`은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이는 `height`로 고정(Native는 늘거나 줄지 않음), 폭은 담는 영역 전체. 행 높이는 모두 `rowHeight`. 한 줄 행이면 `layout.rowHeight.singleLine` 56, 두 줄이면 `twoLine` 68이 기준 | `react/src/virtual-list.tsx`, `react-native/src/virtual-list.tsx`, `foundations.ts` `layout.rowHeight` |
| 간격 | 행 안 여백·구분선·터치 영역(최소 `control.minTouchTarget` 44)은 `renderItem`이 그리는 행 컴포넌트가 정한다 | — |
| 순서·정렬 | `items` 순서대로 위→아래 | `virtualListRecipe.readingOrder` |
| 고정·스크롤 | 그 자체가 **세로 스크롤 영역**이다. 다른 세로 스크롤 영역(ScrollView, 스크롤되는 페이지 본문) 안에 넣지 말고, 고정 머리·하단 바 사이의 남은 높이를 측정해 `height`로 넘긴다 | Web `overflowY: auto`, Native `FlatList` |
| 좁은 폭·큰 글자 | 큰 글자에서 행 내용이 늘어나지 않으므로 글자 배율에 맞춰 `rowHeight`를 다시 계산해 넘긴다 | — |

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
| `layoutStyle` | 있음 | 없음 |
