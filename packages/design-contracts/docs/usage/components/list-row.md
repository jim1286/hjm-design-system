# ListRow

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [ListRow](../../list-row.md), recipe `listRowRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/목록 행`

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
| 이름·값 쌍 | [DescriptionList](description-list.md) |
| 체크·라디오가 행 자체 | [Checkbox](checkbox.md), [Radio](radio.md) |
| 표의 행 | [DataTable](data-table.md) |
| 밀어서 드러나는 행 행동 | [SwipeActions](swipe-actions.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ListRow` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Icon, ListRow } from "@hjmds/react/display";

<ListRow title={t("settings.language")} description={languageName} href="/settings/language"
  trailing={<Icon name="chevronEnd" decorative />} />
```

```tsx
// Native
import { Avatar, ListRow } from "@hjmds/react-native/data-display";

<ListRow title={member.name} description={member.role}
  leading={<Avatar name={member.name} decorative />} leadingShape="circle"
  trailingText={t("member.joined", { date })} onPress={() => openMember(member.id)} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `density` | `compact` · `comfortable` · `relaxed` · `spacious` | `comfortable` | 최소 높이는 설명 유무(한 줄·두 줄)와 함께 정해진다 |
| `leadingShape` | `square` · `circle` | `square` | leading 프레임 크기는 recipe가 그린다 |
| `selected` | `true` · `false` | `false` | — |
| `disabled` | `true` · `false` | `false` | — |
| `href`(Web) | 문자열 | — | 있으면 `<a>` 행 |
| `onClick`(Web) | `(event: MouseEvent<HTMLElement>) => void` | — | 있으면 `<button>` 행 |
| `onPress`(Native) | `(event: GestureResponderEvent) => void` | — | 있으면 누를 수 있는 행 |
| `loading`·`loadingLabel`(Web) | `boolean` · 현지화 문자열 | `false` · — | 같은 슬롯 모양의 자리표시 행. `loadingLabel`이 상태로 읽힌다 |
| `trailingAction`(Native) | ReactNode | — | 행 명령 옆에 따로 그리는 별도 target(IconButton 등). 자기 `onPress`를 가진다 |
| `layoutStyle` | 배치 key만 | — | 행 루트 배치. Native는 슬롯 배치용 `leadingStyle`·`contentStyle`·`titleRowStyle`·`trailingStyle`·`trailingActionStyle`(모두 배치 key만)도 받는다 |
| `titleStyle`·`descriptionStyle`(Native) | — | — | **deprecated**(1.13, 개발 모드 1회 경고, 다음 major 제거) — `density`·`selected`, 글자는 listRowRecipe가 정한다 |

- 상호작용: Web은 `href`면 `<a>`(selected는 `aria-current="page"`), `onClick`이면 `<button>`(selected는 `aria-pressed`),
  둘 다 없으면 `<div>`. Native는 `onPress`가 있으면 누를 수 있는 행이 된다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭은 부모를 가득 채운다(Web `inline-size: 100%`). leading 프레임은 40×40(`leadingSize`), `circle`이면 `radius.full`. trailing 아이콘은 `glyph.sm` 20. 최소 높이는 아래 density 표 | `design-contracts/src/component-recipes.ts`(`listRowRecipe`), `design-contracts/src/foundations.ts`(`layout.rowHeight`) |
| 간격 | leading·content·trailing 사이 `spacing.sm` 12(`listRowRecipe.gap`). 좌우 여백은 모두 `spacing.xs` 8, 위아래 여백은 아래 density 표. 행에 margin을 주지 않는다 | `design-contracts/src/component-recipes.ts`(`listRowRecipe`), `react/src/styles.css`(`.hjm-list-row`) |
| 순서·정렬 | leading → content(제목·설명) → trailing. Native `trailingAction`은 행 명령 바깥 오른쪽(끝)에 따로 놓이고 끝 여백 `spacing.xs` 8을 갖는다. 행 사이 구분선·바깥 둥근 배경은 [List](list.md)가 그린다 | `react-native/src/data-display.tsx`(ListRow) |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 긴 제목·설명은 줄바꿈되고(`overflow-wrap: anywhere`) 행 높이가 늘어난다. 큰 글자에서도 자르지 않는다 | `react/src/styles.css`(`.hjm-list-row`) |

| density | 한 줄 | 두 줄 | 위아래 여백 |
| --- | --- | --- | --- |
| `compact` | 44 | 60 | `spacing.xxs` 4 |
| `comfortable` | 56(`layout.rowHeight.singleLine`) | 68 | `spacing.xs` 8 |
| `relaxed` | 64 | 76 | `spacing.sm` 12 |
| `spacious` | 72 | 84 | `spacing.md` 16 |

```text
┌───────────────────────────────────────────────┐
│8│[40×40]│12│ 제목(bodyLarge bold)       │12│ 값 ›│8│
│ │leading│  │ 설명(body, secondary)      │  │trail│ │
└───────────────────────────────────────────────┘
  최소 높이: comfortable 한 줄 56 · 두 줄 68
```

## 꼭 지킬 것

- Web `href`는 탐색 링크이며 `download` prop은 없다. 다운로드 속성이 필요한 파일은 [Link](link.md)를 사용한다. 큰 미리보기와 다운로드·메뉴 등 독립 행동은 Card로 구성하며 클릭 가능한 행 안에 링크를 중첩하지 않는다. 2026-10-07 파일 사례 대조에서 파일 행의 외형만으로 다운로드 지원을 추론한 대응표를 바로잡았다.

- 제목·설명은 i18n 키로 넣는다. leading의 사진·아이콘은 장식으로 두고 의미는 제목이 말한다.
- 행 안에 다른 버튼을 넣지 않는다. Native는 별도 target을 `trailingAction`에 둔다(행 명령 옆에 따로 그린다).
- 배치는 `layoutStyle`로 한다. 높이·여백·배경을 덮지 않는다. 밀도는 `density`로 바꾼다.
- 아바타 프레임을 제품이 다시 그리지 않는다. `leadingShape`를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목·설명 타입 | `ReactNode` | `string` |
| 자리표시 행 | `loading` + `loadingLabel` | — |
| 링크 행 | `href` | 없음(`onPress`에서 router 호출) |
| 제목 옆 메타·별도 뒤 행동·뒤 문구 | — | `titleMetadata`, `trailingAction`, `trailingText` |
| 접근성 이름 조합 | 요소 내용 | `accessibilityLabel` 없으면 제목·`metadataLabel`·설명·`trailingLabel`을 이어 붙임 |
| 기본 `density` | provider density가 compact면 `compact` | 항상 `comfortable` |

## 함정

- Web 로딩 행은 슬롯의 **존재**로 모양을 정하고 문구는 무시한다. 실제 행과 같은 슬롯을 넘겨야 높이가 맞는다.
- Native `titleStyle`·`descriptionStyle`은 deprecated지만 아직 TextStyle 전체를 받아 색·굵기도 바뀐다. 새 코드에서 쓰지 않는다.
