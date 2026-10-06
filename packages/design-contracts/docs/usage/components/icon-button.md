# IconButton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `iconButtonRecipe`(`src/icon-button-recipe.ts`), NotificationBell 계약: [Compound controls](../../compound-controls.md#notificationbell)
- 스토리북: `배포/컴포넌트/동작/아이콘 버튼` · `배포/컴포넌트/상태와 알림/알림 벨`

## 언제 쓰나

보이는 글자 없이 아이콘만으로 표시하는 행동에 쓴다. 닫기, 뒤로, 더보기, 공유, 즐겨찾기 토글처럼
모양이 널리 통하는 행동이다. 이름은 현지화한 `label`이 접근성 이름으로 읽힌다.
미확인 알림 수가 붙은 알림 진입점은 `NotificationBell`을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 글자 라벨이 있는 행동 | [Button](button.md) |
| 다른 페이지·URL로 이동 | [Link](link.md) |
| 화면 위에 떠 있는 주 행동 | [FloatingActionButton](floating-action-button.md) |
| 여러 아이콘 중 하나를 고름 | [ToggleGroup](toggle-group.md), [SegmentedControl](segmented-control.md) |
| 누를 수 없는 그림 | [Icon](icon.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `IconButton` | 기본 | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` |
| `NotificationBell` | 확장 — 미확인 수 배지 + 증가 시 한 번 흔들림 | `/notification-bell` | `/notification-bell` |

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

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `ghost` · `primary` · `secondary` · `danger` | `ghost` | — |
| `size` | `small` 36 · `medium` 44 · `large` 52 | `medium` | `small`은 터치 여백 4 추가. 아이콘 크기는 각각 `sm`·`md`·`lg` |
| `shape` | `rounded` · `circle` | `rounded` | — |
| `selected` | `true` · `false` | — | 주면 토글이 된다(Web `aria-pressed`, Native 접근성 state) |
| `loading` | `true` · `false` | — | 누름을 막고 스피너로 바꾼다. Native는 기본으로 포커스를 유지한다(`disableWhileLoading`으로만 옛 동작) |
| `loading` 중 `renderLoadingIndicator`(Native) | `(props: { color: string; size: "small" }) => ReactNode` | 기본 스피너 | 스피너를 바꿀 때만 |
| Web `onClick` · Native `onPress` | Web `(event: MouseEvent<HTMLButtonElement>) => void` · Native `(event: GestureResponderEvent) => void` | — | Native는 `onLongPress`도 받는다 |
| `count`(NotificationBell) | 0 이상의 정수 | — | 아니면 `RangeError` |
| `onPress`(NotificationBell) | `() => void` | 필수 | Web·Native 모두 `onPress`다(Web도 `onClick`이 아니다) |
| `active`(NotificationBell) | `true` · `false` | `true` | — |
| `disabled`(NotificationBell) | `true` · `false` | `false` | — |
| Web `layoutStyle`(NotificationBell) | `HjmCompositionStyleProp` | — | 루트 배치. 기본 `alignSelf: "flex-start"`보다 우선하지만 `width`는 무시된다(루트는 항상 `max-content`). 떠 있는 배지가 루트의 끝 모서리에 붙어 있어 루트가 넓어지면 아이콘에서 떨어지기 때문이다. margin·`alignSelf`로 배치한다. 미게시(1.12.1 이후) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 지름: `small` 36 · `medium` 44 · `large` 52. `small`은 hitSlop 4를 더해 터치 영역을 44(`control.minTouchTarget`)에 맞춘다. 아이콘 크기는 `glyph.sm` 20 · `glyph.md` 24 · `glyph.lg` 28이다 | `icon-button-recipe.ts` `iconButtonRecipe` |
| 간격 | [TopBar](top-bar.md)가 슬롯 최소 폭 44, 슬롯 안 간격 `spacing.xs`(8), 좌우 여백 `spacing.md`(16)를 준다. NotificationBell 배지가 버튼 밖으로 넘칠 수 있으니 옆 요소와 간격을 둔다 | `component-recipes.ts` `topBarRecipe`, `styles.css` `.hjm-top-bar` |
| 순서·정렬 | 화면 맨 위에서는 TopBar의 `leading`(뒤로·닫기)과 `actions`/`trailing`(더보기·공유·알림)에 둔다. 행 끝(목록·카드)에는 `size="small"` 또는 `medium`, `tone="ghost"`를 쓴다. NotificationBell은 IconButton 오른쪽 위 모서리(`end: 0`, `top: 0`)에 [CounterBadge](counter-badge.md) `floating`을 겹친다 | `react-native/src/notification-bell.tsx` |
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
| 배치 | `layoutStyle`(IconButton·NotificationBell, NotificationBell은 `width` 무시) | IconButton `layoutStyle`. `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거) — `layoutStyle` 또는 `tone`·`size`·`shape`. NotificationBell은 배치 prop이 없어 감싸는 View로 배치한다 |

## 함정

- children의 색은 버튼이 칠하지 않는다. HJM Icon은 자기 `tone` 색을 쓰므로, `primary`·`danger` 버튼 안에서는
  `tone="inverse"`를 준다. 다른 아이콘 라이브러리의 컴포넌트를 직접 넣으면(Native) 색을 제품이 넘겨야 한다.
- Native `IconButton` `style`은 deprecated지만 다음 major 전까지 recipe 뒤에 합쳐져 지름·배경까지 바뀐다. 새 코드에서 쓰지 않는다.
