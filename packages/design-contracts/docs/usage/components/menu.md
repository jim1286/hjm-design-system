# Menu

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Dropdown 판정](../../dropdown.md), [Popover 경계](../../popover.md), `src/component-recipes.ts`(`menuRecipe`)
- 스토리북: `배포/컴포넌트/탐색/메뉴`

## 언제 쓰나

트리거 버튼을 누르면 뜨는 **항목 목록**에 쓴다. 더보기(⋯) 행동, 정렬 기준 고르기,
보기 옵션 켜고 끄기처럼 안정적인 id를 가진 action·단일 선택·다중 선택 목록이 여기에 속한다.
트리거·떠 있는 표면·항목 목록을 Menu 하나가 소유하므로 별도 Dropdown은 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록이 아닌 임의 콘텐츠(작은 폼, 링크 섞인 본문) | [Popover](popover.md) (Web) |
| 우클릭·키보드 메뉴 키로 포인터 위치에서 여는 메뉴 | [ContextMenu](context-menu.md) |
| 데스크톱 앱의 파일·편집·보기 가로 막대 | [Menubar](menubar.md) (Web) |
| 폼 값 하나를 고르는 입력 | [Select](select.md), [Combobox](combobox.md) |
| 하단에서 올라오는 큰 선택 화면 | [Sheet](sheet.md) |
| 명령 검색 | [CommandPalette](command-palette.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Menu` | 기본 | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/navigation`, `/top-bar` |
| `MorphingMenu` | action 전용 morph 표현(optional peer `bloom-menu` 0.1.0 필요) | `/menu-morph` | — |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Menu } from "@hjmds/react/overlays";

<Menu
  label={t("post.more")}
  trigger={<IconButton label={t("post.more")}>⋯</IconButton>}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

```tsx
// Native
import { Menu } from "@hjmds/react-native/navigation";

<Menu
  triggerLabel={t("post.more")}
  dismissLabel={t("common.close")}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` · `sections` | 둘 중 정확히 하나(Native는 `source`도 가능) | 필수 | 섹션마다 `label` 또는 `accessibilityLabel`이 필요하다. 활성 항목이 하나도 없으면 `TypeError` |
| 항목 모양 | Web `{ id, label: ReactNode, textValue?, description?, leading?, trailing?, tone?, disabled? }` · Native `{ id, label: string, textValue?, description?, shortcut?, tone?, disabled? }` | — | Web `label`이 글이 아니면 `textValue` 필수(typeahead) |
| 항목 `tone` | `neutral` · `danger` | `neutral` | |
| `onAction` | Web `(id: string) => void` · Native `(value) => void \| Promise<void>` | — | 고르는 즉시. 메뉴가 닫히기 전이다 |
| `onActionAfterDismiss` | Web `(id: string) => void` · Native `(value) => void \| Promise<void>` | — | 메뉴가 실제로 닫힌 뒤 한 번. Dialog·Sheet 열기·화면 이동은 여기서 한다 |
| `open` · `defaultOpen` · `onOpenChange` | `onOpenChange: (open: boolean, detail) => void` — Web `detail = { reason }`, Native 두 번째 인자가 `reason` | 비제어 `false` | reason: Web `trigger` · `selection` · `escape` · `outside` · `tab`, Native `trigger` · `selection` · `escape` · `outside` · `programmatic`. 제어하면 `onOpenChange` 필수(Web) |
| 선택(Web) | `selectionMode`: `action` · `single`(`value: string \| null`, `onValueChange(value: string)`) · `multiple`(`value: ReadonlySet<string>`, `onValueChange(value: ReadonlySet<string>)`) | `action` | `defaultValue`로 비제어 |
| 선택(Native) | `selection`: `{ mode: "none" }` · `{ mode: "single", selectedKey, onSelectionChange(key \| null) }` · `{ mode: "multiple", selectedKeys: ReadonlySet, onSelectionChange(keys) }` | `{ mode: "none" }` | `defaultSelectedKey(s)`로 비제어 |
| `density` | `comfortable` · `compact` | `comfortable`(recipe) | Web은 생략하면 Provider density를 따른다 |
| `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message }` | `{ status: "idle" }` | `message`는 현지화(Web `ReactNode`, Native `string`) |
| `align`(Web) | `start` · `end` | `start` | RTL에서 자동 반전 |
| `layoutStyle` | 배치 전용 style 객체 | — | Web은 트리거를 감싼 흐름 안 wrapper, Native는 트리거 host. 표면(popup·Modal)은 따라 움직이지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 높이 `comfortable` 56(`layout.rowHeight.singleLine`) · `compact` 44(`control.minTouchTarget`). Web 표면 폭 `13.75rem`~`min(24rem, 90vw)`, 높이 최대 `100dvh − 2 × spacing.md`. Native 표면 폭 100%·최대 520, 높이 최대 75% | `menuRecipe.density`, `.hjm-menu__content`, `react-native/src/navigation.tsx` |
| 간격 | 항목 좌우 `spacing.sm` 12, leading·문구·단축키 사이 12. 섹션 제목 좌우 12 · 위아래 `spacing.xs` 8. Web: 트리거와 8(`menuRecipe.sideOffset`), 화면 가장자리 8(`collisionPadding`), 안쪽 `spacing.xs` 8(`menuRecipe.surface.padding`; 2026-10-06까지 4, 1.12.1 이후 미게시), 표면·항목 radius `radius.md` 12, 구분선 위아래 4 · 좌우 8. Native: 바깥 여백·안쪽 `spacing.md` 16, 제목·목록·닫기 사이 12, radius `radius.lg` 16 | `collectionItemContract`, `menuRecipe.sectionLabel`·`surface`, `.hjm-menu__*`, `useAnchoredPopup` |
| 순서·정렬 | 일반 행동을 위에, `danger` 행동은 맨 아래. Web `align="start"`(기본)는 트리거 시작 끝, `end`는 끝 끝에 맞춘다(행 끝 ⋯은 `end`). Native는 위→아래 제목 → 항목 → 닫기 버튼(`secondary`) | `menuRecipe`, `src/overlays.tsx` |
| 고정·스크롤 | Web: 트리거에 붙는 portal(z-index `layer.dropdown` 400), 아래가 모자라면 위로 뒤집고 가로는 화면 안으로 민다. 넘치면 표면 안 스크롤. Native: `Modal`로 화면 **가운데**, scrim을 누르면 닫히고 항목 목록만 스크롤 | `useAnchoredPopup`, `react-native/src/navigation.tsx`(`Menu`) |
| 좁은 폭·큰 글자 | Web 폭 상한 `90vw`, 항목 문구는 줄바꿈된다. Native 높이 상한 75%를 넘으면 목록이 스크롤된다 | `.hjm-menu__content`, `maxHeight: "75%"` |

```text
Web (트리거 아래, 앵커)                 Native (Modal, 화면 가운데)
 ┌ 행 ───────────────── [⋯] ┐           ┌──────────── 화면 ─────────────┐
 └──────────────────────────┘           │░░░░░░░░ scrim(누르면 닫힘) ░░░│
              ↓ 8                       │░ ┌─────────────────────────┐ ░│
         ┌─────────────────┐            │░ │ 제목                    │ ░│
         │ 편집            │ ← 56       │░ │ 편집                    │ ░│ ← 항목 56
         │ 공유            │            │░ │ 공유                    │ ░│   (스크롤)
         │─────────────────│            │░ │ 삭제 (danger)           │ ░│
         │ 삭제 (danger)   │            │░ │ [        닫기         ] │ ░│ ← secondary
         └─────────────────┘            │░ └─────────────────────────┘ ░│
          13.75rem ~ 24rem              │░  폭 ≤520 · 높이 ≤75% · 여백 16│
                                        └───────────────────────────────┘
```

## 꼭 지킬 것

- 항목 id는 비어 있지 않고 유일해야 하며, 활성 항목이 하나 이상 있어야 한다. 어기면 렌더 중 던진다.
- Web에서 `label`이 문자열이 아닌 항목은 typeahead용 `textValue`를 준다. 없으면 던진다.
- 다른 모달·시트·화면 이동을 여는 action은 `onActionAfterDismiss`로 실행한다. 이 콜백은 메뉴가 실제로 닫힌 뒤(Native는 Modal teardown 뒤)에만 실행되므로 두 표면이 겹치지 않는다.
- 항목 문구·아이콘(제품 소유)은 i18n 키와 제품 아이콘으로 넣고, 색은 `tone`으로만 바꾼다.
- `MorphingMenu`는 action 전용이다. 선택·async가 필요하면 `Menu`를 쓴다. reduce-motion·RTL에서는 스스로 `Menu`로 돌아간다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 트리거 | `trigger`(element 필수), `label`은 메뉴 이름 | `triggerLabel` 필수, `trigger`/`renderTrigger` 선택 |
| 닫기 버튼 이름 | 없음 | `dismissLabel` 필수 |
| 선택 | `selectionMode="single"\|"multiple"` + `value`/`onValueChange` | `selection={{ mode, selectedKey(s), onSelectionChange }}` |
| 선택 후 실행 | 없음 | `onSelectionAfterDismiss` |
| 상태 | `disabled` | `disabled`, `readOnly`(+`readOnlyLabel`), `busy`, `onRetry`/`retryLabel` |
| 표면 | 트리거에 붙는 portal(`portalContainer`) | `Modal` |
| 항목 label | `ReactNode`(+`textValue`) | `string` |
| 배치 | `className`, `layoutStyle` | `layoutStyle`(`style`은 deprecated — 개발 모드 경고, 다음 major 제거) |
