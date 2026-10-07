# CommandPalette

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [CommandPalette contract](../../command-palette.md), recipe `commandPaletteRecipe`(`src/command-palette.ts`)
- 스토리북: `배포/컴포넌트/오버레이/명령 검색`

## 언제 쓰나

⌘K 스타일로 앱 전체의 **행동**을 검색해 실행하는 모달에 쓴다. 결과는 값이 아니라 행동이며, 실행하면
팔레트는 항상 닫힌다. 최근 항목·명령·검색 결과를 `sections`로 한 목록에 섞을 수 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 검색해서 값을 고르고 필드에 남김 | [Combobox](combobox.md) |
| 버튼에 붙은 행동 목록 | [Menu](menu.md) |
| 우클릭·길게 누르기 메뉴 | [ContextMenu](context-menu.md) |
| 화면 안의 검색 입력 | [SearchField](search-field.md) |
| 확인·입력이 필요한 모달 | [Dialog](dialog.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CommandPalette` | 기본 | `@hjmds/react`, `/command-palette` | 없음 |

Native renderer는 없다(계약이 Web 전용 모달로 정의한다).

## 최소 사용 예

```tsx
// Web
import { CommandPalette } from "@hjmds/react/command-palette";

<CommandPalette
  descriptor={{
    accessibilityLabel: t("palette.label"),
    searchPlaceholder: t("palette.placeholder"),
    emptyMessage: t("palette.empty"),
    closeLabel: t("common.close"),
  }}
  source={paletteSource}
  query={query}
  onQueryChange={setQuery}
  onActivate={runCommand}
  onActivateAfterDismiss={(id) => { if (id === "new-post") openComposerDialog(); }}
  open={open}
  onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}
/>
```

`paletteSource`는 `{ sections: [{ id: "recent", label: t("palette.recent"), items: recentItems }, …] }`처럼 만든다.
기본(`queryState` 없음)은 renderer가 `query`로 항목의 `label`·`textValue`를 부분 일치로 거른다.
항목은 `{ id, label, textValue, description?, shortcut?, disabled?, tone? }`이다. 항목의 label·description·shortcut과
섹션 label은 제품 i18n에서 만든다.

Native: 없음.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel: string; searchPlaceholder: string; emptyMessage?: string; closeLabel?: string }` | 필수 | 앞의 둘은 비면 `TypeError`. `emptyMessage`는 보이는 결과가 없을 때 한 번 알린다. `closeLabel`을 주면 검색 입력 옆에 닫기 버튼이 생긴다(`reason: "close-action"`) |
| `source` | `{ items }` 또는 `{ sections: { id; label?; accessibilityLabel?; items }[] }` | 필수 | 섹션은 `label`·`accessibilityLabel` 중 하나가 필수. `accessibilityLabel`이 있으면 그룹 이름으로 먼저 쓴다 |
| `query` + `onQueryChange` | `string` + `(query: string) => void` | 필수 | 검색어는 항상 제품이 들고 있다 |
| `onActivate` · `onActivateAfterDismiss` | `(itemId: Key, reason: "pointer" \| "keyboard") => void` | `onActivate` 필수 | 실행하면 팔레트가 닫힌다. 다른 오버레이를 여는 명령은 `onActivateAfterDismiss`에서 연다 |
| `queryState` | `{ filtering?: "local"; asyncState? }` · `{ filtering: "external"; asyncState; queryValue: string; resultQuery?: string }` | 로컬 필터링 | `external`이면 renderer가 거르지 않는다. `resultQuery`가 `queryValue`와 다르면 결과는 보이되 실행되지 않는다(늦게 온 응답 보호) |
| `queryState.asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error"; message: string }` | `idle` | 목록 위에 한 번 알린다(`error`는 alert, 나머지는 status). `descriptor.emptyMessage`보다 우선한다 |
| `open` · `defaultOpen` + `onOpenChange` | `boolean` + `(open: boolean, details: { reason }) => void` | `defaultOpen` `false` | reason: `"trigger" \| "close-action" \| "outside" \| "escape" \| "activation" \| "programmatic"` |
| `trigger` | element | — | 주면 그 요소가 팔레트를 열고(`reason: "trigger"`), 닫힌 뒤 포커스 복귀 대상이 된다 |
| `dismissPolicy` | `{ dismissible?, outsideDismiss?, escapeDismiss? }`(`boolean`) | 모두 `true` | 실행(`activation`)으로 닫히는 것은 어떤 정책으로도 막을 수 없다 |
| `renderLeading` | `(itemId: Key) => ReactNode` | — | 행 앞 아이콘을 넣는다 |
| `className` · `portalContainer` | `string` · `HTMLElement` | — | `layoutStyle`은 없다(위치를 recipe가 고정하는 제외 대상) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 `min(100%, 35rem)`(최대 560), 최대 높이 420. 검색 입력 최소 높이 44(`control.fieldHeight`), 항목 최소 높이 44(`control.minTouchTarget`). 모서리 `radius.lg` 16 | `commandPaletteRecipe.content`, `.hjm-command-palette*`, `react/src/command-palette.tsx` |
| 간격 | 화면 가장자리와 `spacing.md` 16(오버레이 padding), 위에서 10vh 띄운다. 검색 입력 좌우 `spacing.md` 16, 목록 안쪽 `spacing.xxs` 4, 항목 좌우 `spacing.sm` 12 · 아이콘↔문구 `spacing.xs` 8, 섹션 이름 위아래 `spacing.xs` 8 · 좌우 `spacing.sm` 12, 상태 문구 `spacing.md` 16 | `.hjm-command-palette-positioner`, `.hjm-command-palette__*` |
| 순서·정렬 | 화면 위쪽 가운데. 위→아래 [검색 입력(아래 경계선) · 닫기 버튼(`closeLabel`이 있을 때 끝 쪽)] → [상태 문구] → [섹션 이름 → 항목들]. 항목은 [leading] → [label · description] → [shortcut(끝 쪽)] | `commandPaletteRecipe.slots`, `.hjm-command-palette__copy`·`__shortcut` |
| 고정·스크롤 | 배경막(`backdrop.modal`)이 화면을 덮는 모달이다. 검색 입력은 위에 고정되고 목록만 스크롤한다(`overscroll-behavior: contain`) | `.hjm-command-palette__search`(`flex: 0 0 auto`), `.hjm-command-palette__viewport` |
| 좁은 폭·큰 글자 | 폭은 화면 − 32까지 줄어든다. 항목 문구는 줄바꿈된다(`flex-wrap`, `overflow-wrap: anywhere`) | `.hjm-overlay`, `.hjm-command-palette__copy` |

```text
┌──────────────────────────────────────┐
│ ▒▒▒▒▒▒▒▒▒ 배경막 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│        ↕ 10vh                        │
│   ┌──────────────────────────────┐   │
│   │ 🔍 명령 검색…            [×] │   │ ← 검색(고정), × 는 closeLabel
│   ├──────────────────────────────┤   │
│   │ 섹션 이름                     │   │
│   │ (아이콘) 명령 이름  설명   ⌘K │   │ ← 항목 44
│   │ …                (스크롤)     │   │ ← 최대 높이 420
│   └──────────────────────────────┘   │
│         최대 폭 560                   │
└──────────────────────────────────────┘
```

## 꼭 지킬 것

- `descriptor`의 두 문구는 필수이고 빈 문자열이면 `TypeError`가 난다.
- 기본은 renderer가 `query`로 `source`를 거른다(`label`·`textValue` 부분 일치, 대소문자 무시). 서버 검색·퍼지 정렬처럼
  제품이 이미 거른 결과는 `queryState={{ filtering: "external", asyncState, queryValue, resultQuery }}`로 넘긴다.
- 결과 없음 문구는 `descriptor.emptyMessage`로 준다. 없으면 빈 목록에 아무 안내도 없다. 로딩·실패는
  `queryState.asyncState`로 알린다.
- 마우스 사용자가 닫을 수 있도록 `descriptor.closeLabel`을 준다. 없으면 Escape·바깥 누름·실행으로만 닫힌다.
- 전역 단축키(⌘K)와 그 범위는 제품이 정하고 바인딩한다. HJM은 키를 듣지 않는다.
- 다른 오버레이를 여는 명령은 `onActivateAfterDismiss`에서 연다. `onActivate`에서 열면 두 모달이 겹친다.
- 배치 prop은 `className`뿐이다(`layoutStyle` 제외 대상). 색·크기를 덮지 않는다.

## 함정

- 현재 renderer는 `query`가 바뀔 때 활성 행을 첫 활성 항목으로 되돌린다. `source`·`queryState`의
  새 참조만으로는 키보드 선택을 초기화하지 않는다. 선택한 ID가 결과에서 없어지면 첫 활성 행으로
  돌아간다. 2026-10-07 실제 source의 의존성과 부모 재렌더 회귀를 대조해 예전 참조 경고를 정정했다.
- 닫을 때 `query`를 지우는 것은 제품 몫이다. 비우지 않으면 다음에 열 때 이전 검색어가 남는다.
- `filtering: "external"`인데 `resultQuery`를 갱신하지 않으면 결과가 보이기만 하고 Enter·클릭이 먹지 않는다(`aria-disabled`).
- 현재 Web 스토리는 제품 쪽에서 `label.includes(query)`로 직접 거르고 결과가 없을 때 `asyncState` `empty`로 안내하며
  `closeLabel`이 없다. 새 코드는 로컬 필터링 기본값과 `emptyMessage`·`closeLabel`을 쓴다.

2026-10-07 동일한 메뉴 입력 패턴을 검사해 늦은 mouseenter가 키보드로 선택한 명령을 되돌리는
문제를 재현했다. 미게시(1.14.0 이후) 수정은 실제 마우스 이동으로만 활성 행을 바꾸므로 팝업
배치의 경계 이벤트는 키보드 선택을 덮지 않는다. 검색 초기화·비활성/오래된 결과 잠금·클릭 실행은
유지한다. [검증 기록](../../../../../docs/qa/2026-10-07-command-records.md).
