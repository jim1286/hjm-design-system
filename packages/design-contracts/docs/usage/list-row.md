# ListRow 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [ListRow](../list-row.md), recipe `listRowRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

목록의 한 줄에 쓴다. 제목, 선택 설명, 앞(아바타·아이콘)·뒤(값·chevron·배지) 슬롯으로 구성되고,
누르면 상세로 가거나 행동을 하는 행, 정보만 보여 주는 행 모두 여기에 속한다. 행 사이 구분선은 감싸는
[List](list.md)가 소유한다.

| 화면 형태 | 쓸 것 |
| --- | --- |
| 행 한 줄 | `ListRow` |
| 행 묶음과 구분선 | [List](list.md) |
| 고정 높이 행 수백~수천 개 | [VirtualList](virtual-list.md)의 `renderItem` 안에서 `ListRow` |
| 다음 페이지 요청 | [LoadMore](load-more.md) |

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 이미지·여러 행동이 있는 카드 | [Card](card.md) |
| 알림 한 건(읽음 표시·시간) | [NotificationItem](notification-item.md) |
| 이름·값 쌍 | [DescriptionList](description-list.md) |
| 체크·라디오가 행 자체 | [Checkbox](checkbox.md), [Radio](radio.md) |
| 표의 행 | [DataTable](data-table.md) |
| 밀어서 드러나는 행 행동 | [SwipeActions](swipe-actions.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ListRow` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

## 최소 사용 예

```tsx
// Web
import { ListRow } from "@hjmds/react/display";

<ListRow title={t("settings.language")} description={languageName} href="/settings/language"
  trailing={<Icon name="chevronEnd" />} />
```

```tsx
// Native
import { ListRow } from "@hjmds/react-native/data-display";

<ListRow title={member.name} description={member.role} leading={<Avatar /* ... */ />} leadingShape="circle"
  trailingText={t("member.joined", { date })} onPress={() => openMember(member.id)} />
```

## 축과 기본값

- `density`: `compact` · `comfortable`(기본) · `relaxed` · `spacious`. 최소 높이는 설명 유무(한 줄·두 줄)와 함께 정해진다.
- `leadingShape`: `square`(기본) · `circle`. leading 프레임 크기는 recipe가 그린다.
- `selected`: 기본 false. `disabled`: 기본 false.
- 상호작용: Web은 `href`면 `<a>`(selected는 `aria-current="page"`), `onClick`이면 `<button>`(selected는 `aria-pressed`),
  둘 다 없으면 `<div>`. Native는 `onPress`가 있으면 누를 수 있는 행이 된다.

## 꼭 지킬 것

- 제목·설명은 i18n 키로 넣는다. leading의 사진·아이콘은 장식으로 두고 의미는 제목이 말한다.
- 행 안에 다른 버튼을 넣지 않는다. Native는 별도 target을 `trailingAction`에 둔다(행 명령 옆에 따로 그린다).
- 배치는 `layoutStyle`로 한다. 높이·여백·배경을 덮지 않는다. 밀도는 `density`로 바꾼다.
- 아바타 프레임을 제품이 다시 그리지 않는다. `leadingShape`를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목·설명 타입 | `ReactNode` | `string` |
| 자리표시 행 | `loading` + `loadingLabel` | 없음 |
| 링크 행 | `href` | 없음(`onPress`에서 router 호출) |
| 제목 옆 메타·별도 뒤 행동·뒤 문구 | 없음 | `titleMetadata`, `trailingAction`, `trailingText` |
| 접근성 이름 조합 | 요소 내용 | `accessibilityLabel` 없으면 제목·`metadataLabel`·설명·`trailingLabel`을 이어 붙임 |
| 기본 `density` | provider density가 compact면 `compact` | 항상 `comfortable` |

## 함정

- Web 로딩 행은 슬롯의 **존재**로 모양을 정하고 문구는 무시한다. 실제 행과 같은 슬롯을 넘겨야 높이가 맞는다.
- Native `titleStyle`·`descriptionStyle`은 TextStyle 전체를 받아 색·굵기도 바뀐다. 읽음 표시 같은 의미는 NotificationItem을 쓴다.
