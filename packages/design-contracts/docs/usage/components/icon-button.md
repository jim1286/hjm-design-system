# IconButton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: recipe `iconButtonRecipe`(`src/icon-button-recipe.ts`), NotificationBell 계약: [Compound controls](../../compound-controls.md#notificationbell)
- 스토리북: `배포/컴포넌트/동작/아이콘 버튼` · `배포/컴포넌트/상태와 알림/알림 벨`

## 언제 쓰나

보이는 글자 없이 아이콘만으로 표시하는 행동에 쓴다. 닫기, 뒤로, 더보기, 공유, 즐겨찾기 토글처럼
모양이 널리 통하는 행동이다. 이름은 현지화한 `label`이 접근성 이름으로 읽힌다.

**도구성 행동은 글자 버튼이 아니라 IconButton으로 표시한다.** 새로고침·추가(새 기록·새 컬렉션)·편집·삭제·공유·
검색 열기·필터·정렬·더보기·설정·복사·내려받기, 도구 막대의 닫기가 여기에 해당한다. 화면 헤더 `actions`, 목록·카드 행 끝,
도구 막대에 둔다. 예전에 보이던 글자는 `label`로 옮겨 보조기술 이름으로 읽힌다. 아이콘은 제품이 넘긴다(HJM `Icon`
또는 제품 아이콘 라이브러리). HJM 화면·구성이 이런 행동을 직접 그리면 아이콘 슬롯을 쓴다 —
`ScreenFlowAction.icon`(ListDetailScreen `refresh` 등), SavedItemsScreen `createCollectionIcon`, Popover `closeIcon`(Web).

글자 버튼으로 남기는 것: 화면의 주 행동과 확인 행동(저장·완료·보내기·로그인), 상태 영역의 다시 시도,
Dialog·Sheet footer 행동, 목록 끝 "더 보기", 온보딩 다음·이전, 선택 일괄 행동처럼 결과를 글자로 확인해야 하는 행동.
미확인 알림 수가 붙은 알림 진입점은 `NotificationBell`을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 글자로 결과를 확인해야 하는 주 행동·확인 행동(저장·완료·보내기) | [Button](button.md) |
| 글자로 다른 페이지·URL로 이동 | [Link](link.md) |
| 아이콘만으로 다른 페이지로 이동(셸의 설정·프로필 진입점) | `IconButtonLink`(아래). `<button>`에 router push를 달거나 `<a>`에 제품 CSS로 원형·현재 표시를 그리지 않는다 |
| 화면 위에 떠 있는 주 행동 | [FloatingActionButton](floating-action-button.md) |
| 여러 아이콘 중 하나를 고름 | [ToggleGroup](toggle-group.md), [SegmentedControl](segmented-control.md) |
| 누를 수 없는 그림 | [Icon](icon.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `IconButton` | 기본 | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` |
| `IconButtonLink` | 동반(이동) — IconButton 모양의 링크. 현재 페이지 표시 `current`. 개발 소스·미게시 | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` |
| `NotificationBell` | 확장 — 미확인 수 배지 + 증가 시 한 번 흔들림 | `/notification-bell` | `/notification-bell` |
| `ClipboardIconButton` | 동반(복사) — 아이콘만 있는 복사 도구 행동. `value`, `labels: { idle; copied }`(두 상태의 접근성 이름), `onCopy?`, `onCopyError?`, `feedbackDuration?`(ms), `tone` 기본 `ghost` | `@hjmds/react`, `/clipboard` | — |

`NotificationBell`은 granular subpath로만 import 된다. 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Icon } from "@hjmds/react/display";

<IconButton label={t("common.close")} onClick={close}>
  <Icon name="close" />
</IconButton>
```

```tsx
// Native
import { IconButton } from "@hjmds/react-native/actions";
import { Icon } from "@hjmds/react-native/primitives";
import { NotificationBell } from "@hjmds/react-native/notification-bell";
// renderGlyph는 createLucideGlyph로 만든다(icon.md 참고).

<IconButton label={t("common.more")} onPress={openMenu}>
  <Icon descriptor={{ name: "more" }} renderGlyph={renderGlyph} />
</IconButton>

<NotificationBell
  label={t("inbox.open", { count: unread })}
  count={unread}
  icon={<Icon descriptor={{ name: "notifications" }} renderGlyph={renderGlyph} />}
  onPress={openInbox}
  active={isFocused}
/>
```

### 아이콘 링크 — `IconButtonLink` (2026-10-23, 개발 소스·미게시)

Button에 대한 ButtonLink처럼 IconButton 틀(`tone`·`size`·`shape`·`edge`·`hitSlop`·`layoutStyle`)을 이동 링크에 쓴다.
토글·로딩·변경 행동은 IconButton에 남는다. `current`는 지금 보고 있는 화면의 진입점이며 선택된 IconButton과 같은 면
(`iconButtonRecipe.states.selected`)으로 칠하고 Web `aria-current="page"`, Native `accessibilityState.selected`로 알린다.

| prop | Web | Native | 기본값 |
| --- | --- | --- | --- |
| 목적지 | `href: string` | `destination: LinkDestination` | 필수 |
| 이름 | `label: string`(접근성 이름, 빈 값이면 `TypeError`) | 같음 | 필수 |
| `current` | `boolean` → `aria-current="page"` + 선택 면 | `boolean` → `selected` + 선택 면 | `false` |
| `disabled` | `href`를 지우고 클릭·가운데 클릭을 막는다(ButtonLink와 같다) | 누름을 막는다 | `false` |
| router 연결 | `renderAnchor(props)` — `ref`·`href`·이름·`aria-current`·차단 핸들러가 담긴 props를 자기 링크에 펼친다 | `onNavigate(destination)` 또는 `renderLink(props)`(TopBarAction `intent="link"`와 같다). 둘 다 없으면 `TypeError` | — |

```tsx
// Web (Next.js)
import NextLink from "next/link";
import { IconButtonLink } from "@hjmds/react/actions";

<IconButtonLink href={`/${locale}/settings`} label={t("action.settings")} shape="circle"
  current={pathname.endsWith("/settings")} renderAnchor={(props) => <NextLink {...props} />}>
  <Icon name="settings" decorative />
</IconButtonLink>
```

```tsx
// Native (Expo Router)
import { Link } from "expo-router";
import { IconButtonLink } from "@hjmds/react-native/actions";

<IconButtonLink label={t("action.settings")} destination={{ kind: "internal", href: "/settings" }} current={focused}
  renderLink={({ destination, ...props }) => <Link href={destination.href} asChild><Pressable {...props} /></Link>}>
  <Icon descriptor={{ name: "settings", decorative: true }} renderGlyph={renderGlyph} />
</IconButtonLink>
```

`renderAnchor`·`renderLink`는 함수 prop이라 Next 서버 컴포넌트에서 넘길 수 없다. 현재 경로로 `current`를 정하는 셸
Client Component에서 연결한다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `ghost` · `primary` · `secondary` · `danger` | `ghost` | — |
| `size` | `small` 36 · `medium` 44 · `large` 52 | `medium` | `small`은 터치 여백 4 추가. 아이콘 크기는 각각 `sm`·`md`·`lg` |
| `shape` | `rounded` · `circle` | `rounded` | — |
| `elevation` | `none` · `raised` · `floating` · `overlay` | `none` | 떠 있는 컨트롤(번뚝 Dock 가운데 버튼)의 그림자 토큰 단계(`iconButtonRecipe.elevation`). `primary`·`secondary`·`danger`만 받고 `ghost`에 주면 `TypeError`. Web은 `--hjm-shadow-<단계>`, Native는 iOS 그림자 + Android elevation. `IconButtonLink`에는 없다(미게시, 2026-10-23) |
| `selected` | `true` · `false` | — | 주면 토글이 된다(Web `aria-pressed`, Native 접근성 state) |
| `edge` | `start` · `end` · `both` | — | 버튼이 놓인 컨테이너 가장자리(논리 방향, RTL에서 뒤집힘). `ghost`면 터치 영역은 그대로 두고 그 쪽으로 (보이는 지름 − 아이콘 칸) / 2만큼 내민다(`medium` 10, `small` 8, `large` 12, `resolveIconButtonEdgeOverhang`). 테두리·배경이 있는 tone은 틀이 정렬 기준이라 움직이지 않는다 |
| `loading` | `true` · `false` | — | 누름을 막고 스피너로 바꾼다. Native는 기본으로 포커스를 유지한다(`disableWhileLoading`으로만 옛 동작) |
| `loading` 중 `renderLoadingIndicator`(Native) | `(props: { color: string; size: "small" }) => ReactNode` | 기본 스피너 | 스피너를 바꿀 때만 |
| Web `onClick` · Native `onPress` | Web `(event: MouseEvent<HTMLButtonElement>) => void` · Native `(event: GestureResponderEvent) => void` | — | Native는 `onLongPress`도 받는다 |
| `count`(NotificationBell) | 0 이상의 정수 | — | 아니면 `RangeError` |
| `onPress`(NotificationBell) | `() => void` | 필수 | Web·Native 모두 `onPress`다(Web도 `onClick`이 아니다) |
| `active`(NotificationBell) | `true` · `false` | `true` | — |
| `disabled`(NotificationBell) | `true` · `false` | `false` | — |
| Web `layoutStyle`(NotificationBell) | `HjmCompositionStyleProp` | — | 루트 배치. 기본 `alignSelf: "flex-start"`보다 우선하지만 `width`는 무시된다(루트는 항상 `max-content`). 떠 있는 배지가 루트의 끝 모서리에 붙어 있어 루트가 넓어지면 아이콘에서 떨어지기 때문이다. margin·`alignSelf`로 배치한다. 1.13.0 변경 |

### 상단 도구 예외

2026-10-21 사용자 승인: 상단 도구 줄은 `size="small" hitSlop={0}`, 버튼 영역 사이 `spacing.xxs` 4를 사용한다. 제품 앱·웹 Provider의 `minimumVisualTarget`은 끈다. 일반 작은 버튼의 기본 확장 4와 본문·하단 행동 간격 8은 유지한다. [TopBar 공통 크기](top-bar.md#상단-도구의-공통-크기)를 따른다.

`hitSlop`은 Web에서 0 이상의 px 수치, Native에서 RN `PressableProps['hitSlop']`다. Web은 포인터 확장용 pseudo-element에 반영하고 DOM 속성으로 전달하지 않는다. 생략하면 기존 크기 recipe의 확장을 유지한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 지름: `small` 36 · `medium` 44 · `large` 52. `small`은 hitSlop 4를 더해 터치 영역을 44(`control.minTouchTarget`)에 맞춘다. 아이콘 크기는 `glyph.sm` 20 · `glyph.md` 24 · `glyph.lg` 28이다 | `icon-button-recipe.ts` `iconButtonRecipe` |
| 간격 | [TopBar](top-bar.md)가 슬롯 최소 폭 44, 슬롯 안 간격 `spacing.xs`(8), 좌우 여백 `spacing.md`(16)를 준다. NotificationBell 배지는 버튼 위로 6만큼 올라오고 끝 쪽으로는 넘치지 않는다 | `component-recipes.ts` `topBarRecipe`, `styles.css` `.hjm-top-bar` |
| 가장자리 정렬 | 행·헤더·카드의 시작/끝 가장자리에 놓인 ghost IconButton은 `edge`를 준다. 아이콘 칸(`medium` 24)이 컨테이너 안쪽 여백 선(보통 16)에 오고 44 터치 영역은 여백 쪽으로 10 넘어간다. 같은 줄에 여러 버튼이 있으면 가장자리에 닿은 마지막(또는 첫) 버튼에만 준다. HJM이 그리는 화면 나가기(`exit`)와 SavedItemsScreen 새 컬렉션, ListDetailScreen 새로고침, MediaSelectionScreen 추가, UploadItem 취소·다시 시도, InlineEdit·RepeatableFieldGroup·TableColumnSettings 행 끝 도구, SearchScreen 정렬·전체 삭제는 이미 적용돼 있다. 제품이 헤더 `actions`·ListRow `trailing`·Native `trailingAction`에 넣는 끝 버튼은 제품이 `edge="end"`를 준다. Web 포커스 링은 잘리지 않게 버튼 안쪽에 그린다 | `icon-button-recipe.ts` `iconButtonRecipe.edge`·`resolveIconButtonEdgeOverhang`, `react/src/theme.ts`(`--hjm-icon-button-edge-*`), `styles.css` `[data-edge]`, `react-native/src/actions.tsx` |
| 순서·정렬 | 화면 맨 위에서는 TopBar의 `leading`(뒤로·닫기)과 `actions`/`trailing`(더보기·공유·알림)에 둔다. 행 끝(목록·카드)에는 `size="small"` 또는 `medium`, `tone="ghost"`를 쓴다. NotificationBell은 `iconButtonRecipe.badge`대로 [CounterBadge](counter-badge.md) `small`·`floating`을 버튼 끝 모서리(끝 0)에 두고, 배지 아래 테두리 2(`stroke.strong`)만 아이콘 칸 위쪽에 닿도록 올린다(`resolveIconButtonBadgeOffset`, 작은 버튼은 위 −6). 자릿수가 늘면 시작 쪽으로 넓어지고 아이콘을 덮지 않는다. 2026-10-23 웹 확인에서 `medium` 배지를 `top: 0`에 두어 18px 아이콘의 82%를 가린 것을 고쳤다 | `react-native/src/notification-bell.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

```text
TopBar
┌─────────────────────────────────────┐
│ [←]        화면 제목       [벨³][⋯] │  ← leading 44 / trailing 간격 xs 8, 좌우 여백 md 16
└─────────────────────────────────────┘
```

## 꼭 지킬 것

- `label`은 모양이 아니라 행동을 말한다("돋보기"가 아니라 "검색"). Native는 빈 `label`·빈 children을 `TypeError`로 거부한다.
- 도구성 행동(새로고침·추가·편집·삭제·공유·검색·필터·정렬·더보기·설정·복사)을 헤더·행·도구 막대에 글자 버튼으로 두지 않는다.
  같은 행동이 여러 행에 있으면 `label`에 대상을 넣는다("할 일 A 삭제").
- 안의 Icon은 장식으로 둔다. 이름은 버튼이 이미 읽는다.
- 배치는 `layoutStyle`로만 한다. 지름·radius·배경을 `style`/`className`으로 덮지 않는다.
- NotificationBell의 `label`에 미확인 수를 포함한 현지화 문구를 넣는다. 배지와 그림은 접근성에서 숨겨진다.
  눌러도 읽음 처리는 하지 않는다. 읽음 처리는 제품이 한다.
- Native에서 화면이 가려진 채 mounted면 `active={false}`를 넘겨 흔들림을 멈춘다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress`, `onLongPress` |
| 기본 `type` | `"button"` | 해당 없음 |
| 스피너 교체 | 없음 | `renderLoadingIndicator` |
| 비활성이지만 포커스 유지 | `aria-disabled` | `loading` 기본 동작 |
| NotificationBell 흔들림 정지 | 문서 숨김·reduced motion | AppState 비활성·reduced motion |
| 배치 | `layoutStyle`(IconButton·NotificationBell, NotificationBell은 `width` 무시) | IconButton `layoutStyle`. `style`은 제거된 속성 — `layoutStyle` 또는 `tone`·`size`·`shape`. NotificationBell은 배치 prop이 없어 감싸는 View로 배치한다 |

## 함정

- children의 색은 버튼이 칠하지 않는다. HJM Icon은 자기 `tone` 색을 쓰므로, `primary`·`danger` 버튼 안에서는
  `tone="inverse"`를 준다. 다른 아이콘 라이브러리의 컴포넌트를 직접 넣으면(Native) 색을 제품이 넘겨야 한다.
- Native `IconButton`의 `style`은 제거되었다. 배치는 `layoutStyle`, 외형은 `tone`·`size`·`shape`로 지정한다.

2026-10-10 사용자 요청: Button과 같은 선택 표현을 쓴다. 선택은 bg 바탕·contentBrand 아이콘으로
표시하고 추가 선택 테두리는 없다. aria-pressed/Native selected와 키보드 focus outline은 유지한다.

## 근거

- `IconButtonLink`: 2026-10-23 다에리 웹 소비 감사 — 셸 설정 진입점(`ShellSettingsLink`)이 IconButton은 `<button>`만, ButtonLink는
  가로 padding이 있는 pill이라 둘 다 쓸 수 없어 `Link` + 제품 `.settings-link` CSS(44 원형, `aria-current` 배경)로 다시 그렸다.
- 가장자리 정렬(`edge`): 2026-10-17 화면 정렬 실측 감사(Web Storybook 402·1280, Native iPhone 17 Pro 3x 캡처). 행·헤더 끝의 44 버튼이
  아이콘을 여백 선보다 10~15 안쪽에 두었다(댓글 더보기 28 vs 아바타 16, 화면 머리 뒤로 31 vs 16, 업로드 취소 26 vs 16, 정렬 화살표 29 vs 16).
  컴포넌트마다 오프셋을 따로 두지 않고 이 한 규칙과 계약 값으로 맞췄다. Toast 닫기(같은 날 `toastRecipe.close.inlineOverhang`)와 같은 식이다.
- 도구성 행동은 IconButton: 2026-10-17 사용자 지시 — '나의 기록' 헤더의 새로고침·새 기록 글자 버튼.
- 선택 표현: 2026-10-10 사용자 요청 — Button과 같은 선택 표현을 쓴다.
