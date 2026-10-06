# IconButton 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `iconButtonRecipe`(`src/icon-button-recipe.ts`), NotificationBell 계약: [Compound controls](../compound-controls.md#notificationbell)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `IconButton` | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` | 기본 |
| `NotificationBell` | `/notification-bell` | `/notification-bell` | 미확인 수 배지 + 증가 시 한 번 흔들림 |

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

- `tone`: `ghost`(기본) · `primary` · `secondary` · `danger`.
- `size`: `small` 36(터치 여백 4 추가) · `medium`(기본) 44 · `large` 52. 아이콘 크기는 각각 `sm`·`md`·`lg`.
- `shape`: `rounded`(기본) · `circle`. `selected`를 주면 토글이 된다(Web `aria-pressed`, Native 접근성 state).
- `loading`은 누름을 막고 스피너로 바꾼다. Native는 기본으로 포커스를 유지한다(`disableWhileLoading`으로만 옛 동작).
- NotificationBell: `count`는 0 이상의 정수(아니면 `RangeError`), `active` 기본 true, `disabled` 기본 false.

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

## 함정

- children의 색은 버튼이 칠하지 않는다. HJM Icon은 자기 `tone` 색을 쓰므로, `primary`·`danger` 버튼 안에서는
  `tone="inverse"`를 준다. 다른 아이콘 라이브러리의 컴포넌트를 직접 넣으면(Native) 색을 제품이 넘겨야 한다.
- Native `IconButton`에는 아직 `style` prop이 있고 recipe 뒤에 합쳐진다. 타입이 막지 않으므로 리뷰에서 거른다.
