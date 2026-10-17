# ListRow

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
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

<ListRow title={t("account.delete")} tone="danger" onPress={openDeleteConfirmation} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `density` | `compact` · `comfortable` · `relaxed` · `spacious` | `comfortable` | 최소 높이는 설명 유무(한 줄·두 줄)와 함께 정해진다 |
| `leadingShape` | `square` · `circle` | `square` | leading 프레임 크기는 recipe가 그린다 |
| `tone` | `default` · `danger` | `default` | 탈퇴 같은 파괴적 목적지 제목은 `danger`로 강조한다. 선택·잠금·밀도와 독립적이다 |
| `selected` | `true` · `false` | `false` | — |
| `disabled` | `true` · `false` | `false` | — |
| `href`(Web) | 문자열 | — | 있으면 `<a>` 행 |
| `onClick`(Web) | `(event: MouseEvent<HTMLElement>) => void` | — | 있으면 `<button>` 행 |
| `onPress`(Native) | `(event: GestureResponderEvent) => void` | — | 있으면 누를 수 있는 행 |
| `loading`·`loadingLabel` | `boolean` · 현지화 문자열 | `false` · — | 같은 슬롯 모양의 자리표시 행. `loadingLabel`이 상태로 읽힌다 |
| `trailingAction` | ReactNode | — | 행 명령 옆에 따로 그리는 별도 target(IconButton 등, 끝에 둘 때 `edge="end"`). 자기 `onPress`/`onClick`을 가진다 |
| `layoutStyle` | 배치 key만 | — | 행 루트 배치. Native는 슬롯 배치용 `leadingStyle`·`contentStyle`·`titleRowStyle`·`trailingStyle`·`trailingActionStyle`(모두 배치 key만)도 받는다 |
| `titleStyle`·`descriptionStyle`(Native) | — | — | 제거된 속성 — 배치는 `layoutStyle`, 제목의 위험색은 `tone="danger"`, 글자는 listRowRecipe가 정한다 |

- 상호작용: Web은 `href`면 `<a>`(selected는 `aria-current="page"`), `onClick`이면 `<button>`(selected는 `aria-pressed`),
  둘 다 없으면 `<div>`. Native는 `onPress`가 있으면 누를 수 있는 행이 된다.

## 배치

Native 원형 leading의 `full`은 Provider token에서 읽지만 고정 원형 역할을 유지한다. square leading은 모서리를 부여하지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 행 표면(누름·hover·선택 배경, 포커스 링, 누를 수 있는 영역)은 부모 콘텐츠 폭보다 양쪽으로 `listRowRecipe.surfaceBleed`(= density `paddingHorizontal`, `spacing.xs` 8)씩 넓다(Web `inline-size: calc(100% + 16)` + `margin-inline: -8`, Native `marginHorizontal: -8`). 글자·leading·trailing은 부모 콘텐츠 가장자리에 놓인다. leading 프레임은 40×40(`leadingSize`), `circle`이면 `radius.full`. trailing 아이콘은 `glyph.sm` 20. 최소 높이는 아래 density 표 | `design-contracts/src/component-recipes.ts`(`listRowRecipe`), `design-contracts/src/foundations.ts`(`layout.rowHeight`) |
| 간격 | leading·content·trailing 사이 `spacing.sm` 12(`listRowRecipe.gap`). 행 안 좌우 여백 8은 표면이 바깥으로 넓어진 만큼이라 글자는 부모 콘텐츠 가장자리(기본 화면이면 여백 선 16)에서 시작한다. 위아래 여백은 아래 density 표. Native의 투명 선택 테두리 1은 이 여백 안에 포함된다(테두리 + padding = 8). 제품은 행에 margin을 주지 않는다 | `design-contracts/src/component-recipes.ts`(`listRowRecipe`), `react/src/styles.css`(`.hjm-list-row`) |
| 순서·정렬 | leading → content(제목·설명) → trailing. trailing 내용(아이콘·Switch·문구)은 행의 세로 가운데에 둔다(Web `.hjm-list-row__trailing` flex 가운데, Native 행 가운데 정렬 View). `trailingAction`(두 플랫폼)은 행 명령 바깥 끝에 `listRowRecipe.gap` 12 떨어져 놓이고, 명령과 함께 하나의 표면(선택 배경·테두리)을 쓴다. 행동 상자의 끝은 부모 콘텐츠 가장자리에 맞으므로 ghost IconButton에 `edge="end"`를 주면 glyph 칸 끝이 여백 선 16에 온다. 행 사이 구분선·바깥 둥근 배경은 [List](list.md)가 그린다 | `react-native/src/data-display.tsx`(ListRow), `react/src/styles.css`(`.hjm-list-row__trailing`) |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 긴 제목·설명은 줄바꿈되고(`overflow-wrap: anywhere`) 행 높이가 늘어난다. 큰 글자에서도 자르지 않는다 | `react/src/styles.css`(`.hjm-list-row`) |

| density | 한 줄 | 두 줄 | 위아래 여백 |
| --- | --- | --- | --- |
| `compact` | 44 | 60 | `spacing.xxs` 4 |
| `comfortable` | 56(`layout.rowHeight.singleLine`) | 68 | `spacing.xs` 8 |
| `relaxed` | 64 | 76 | `spacing.sm` 12 |
| `spacious` | 72 | 84 | `spacing.md` 16 |

```text
화면 끝 ↓   여백 선 16 ↓                                  ↓ 여백 선 16
        ┌─8─┬──────────────────────────────────────────┬─8─┐ ← 행 표면(누름·선택 배경), 8씩 바깥으로
        │   │[40×40]│12│ 제목(bodyLarge bold)  │12│ 값 ›│   │
        │   │leading│  │ 설명(body, secondary) │  │trail│   │
        └───┴──────────────────────────────────────────┴───┘
  섹션 제목·결과 개수(16)와 행 글자·leading(16)이 같은 선에서 시작한다
  최소 높이: comfortable 한 줄 56 · 두 줄 68
```

## 꼭 지킬 것

- Web `href`는 탐색 링크이며 `download` prop은 없다. 다운로드 속성이 필요한 파일은 [Link](link.md)를 사용한다. 큰 미리보기와 다운로드·메뉴 등 독립 행동은 Card로 구성하며 클릭 가능한 행 안에 링크를 중첩하지 않는다. 2026-10-07 파일 사례 대조에서 파일 행의 외형만으로 다운로드 지원을 추론한 대응표를 바로잡았다.

- 제목·설명은 i18n 키로 넣는다. leading의 사진·아이콘은 장식으로 두고 의미는 제목이 말한다.
- 행 안에 다른 버튼을 넣지 않는다. 별도 target은 `trailingAction`에 둔다(행 명령 옆에 따로 그린다).
- 행은 부모가 좌우로 8 이상의 여백을 가진 곳에 둔다(화면 본문 16, Card·Sheet·SidePanel 본문, `grouped` List). 여백이 0인 상자(예: 여백 없는 분할 패널, 제품의 꽉 찬 div)에 바로 두면 표면이 잘리고 Web은 가로 스크롤이 생긴다. 그 상자에 콘텐츠 여백을 준다. `ScreenLayout contentInset="body-edge"` 본문은 자기 여백 16을 가진 전체 폭 행(ConversationRow·NotificationRow) 전용이다. ListRow·NotificationItem은 `default` 본문에 둔다(그래야 글자가 여백 선 16에 온다).
- 배치는 `layoutStyle`로 한다. 높이·여백·배경을 덮지 않는다. 밀도는 `density`로 바꾼다.
- 아바타 프레임을 제품이 다시 그리지 않는다. `leadingShape`를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목·설명 타입 | `ReactNode` | `string` |
| 자리표시 행 | `loading` + `loadingLabel` | `loading` + `loadingLabel` |
| 링크 행 | `href` | 없음(`onPress`에서 router 호출) |
| 제목 옆 메타·뒤 문구 | — | `titleMetadata`, `trailingText` |
| 접근성 이름 조합 | 요소 내용 | `accessibilityLabel` 없으면 제목·`metadataLabel`·설명·`trailingLabel`을 이어 붙임 |
| 기본 `density` | provider density가 compact면 `compact` | 항상 `comfortable` |

## 함정

- Web 로딩 행은 슬롯의 **존재**로 모양을 정하고 문구는 무시한다. 실제 행과 같은 슬롯을 넘겨야 높이가 맞는다.
- Native `titleStyle`·`descriptionStyle`은 제거되었다. 파괴적 목적지의 제목 강조에는 양 플랫폼 공통 `tone="danger"`를 사용한다. `tone`은 확인 절차나 삭제 실행을 대신하지 않는다.


로딩 행은 실제 ListRow의 density·한 줄/두 줄 최소 높이와 padding을 그대로 사용한다. 두 줄 결과를
예상하면 `description`을 제공한다(자리표시 중 문구 자체는 표시하지 않는다). loading 동안 행과
trailingAction은 실행할 수 없으며 실제 슬롯 내용도 마운트하지 않는다. 여러 로딩 행 중 첫 행에만
`loadingLabel`을 주고 나머지는 접근성 트리에서 숨긴다. 검색 화면도 임의 Skeleton 조립 대신 이 계약을 쓴다.

### 독립 행동과 라우터 연결 (미게시, 1.23.0 이후)

Web도 Native와 같이 `trailingAction`을 지원한다. 이 슬롯은 행의 link/button 바깥에 놓이므로
팔로우·삭제 같은 행동을 링크에 중첩하지 않는다. `renderLink`는 HJM이 만든 anchor props를
프레임워크 Link에 전달하는 연결점이다. 배치·제목·앞/뒤 슬롯은 HJM이 계속 만든다.
예: `renderLink={props => <Link {...props} href={props.href!} />}`.

## 근거

- trailing 세로 가운데: 2026-10-17 정렬 실측(Web 402). trailing span이 block이라 안의 inline svg가 글자 기준선에 놓여 행 가운데보다 2~2.5px 위였다(설정 334/331.5, 컬렉션 184/181.5). Native는 행 가운데(388/388)였다. trailing을 flex 가운데 상자로 바꾼 뒤 Web도 334/334, 184/184로 측정됐다.
- 글자를 여백 선에, 표면은 바깥으로: 2026-10-17 사용자 결정. 행이 누름 배경용 좌우 여백 8을 콘텐츠 안에 두어 기본 화면에서 행 글자가 16 + 8 = 24에서 시작했고, 같은 화면의 섹션 제목·검색 결과 머리("결과 N개")·설정 묶음 제목은 16에서 시작했다(Web 402 실측: 검색 결과 행 24 / 머리 16, 설정 leading 24 / 묶음 제목 16, 알림 leading 24 / "오늘" 16. Native 3x 화면 잉크: 결과 행 제목 25 / 개수 16.7 — Native는 투명 선택 테두리 1까지 더해졌다). 표면을 바깥으로 8 넓히는 방식으로 바꾼 뒤 Web 402·1280, LTR·RTL 모두 행 글자·leading 시작과 trailing 끝이 16(1280은 화면 열 기준 296)으로, Native는 결과 행 제목 잉크 16, 설정 leading 아이콘 잉크 36 → 27, 알림 42.3 → 33(프레임 16 + 아이콘 안쪽 여백)으로 측정됐다. 구분선 시작도 글자 위치(52)로 옮겼다.
