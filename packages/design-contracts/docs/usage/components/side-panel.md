# SidePanel

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [SidePanel](../../side-panel.md), `src/side-panel.ts`(`sidePanelRecipe`, `sidePanelBehaviorDefaults`)
- 스토리북: `배포/컴포넌트/오버레이/측면 패널`

## 언제 쓰나

Web 화면 가장자리(시작·끝)에 도킹되어 밀려 나오는 보조 패널에 쓴다. 목록 옆 상세 편집, 필터,
보조 내비게이션이 전형이다. 기본은 모달(초점 가둠·스크롤 잠금)이고, 뒤 페이지를 계속 조작해야 하면
비모달(`dismissPolicy.modal: false`)로 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모바일·Native, 하단에서 올라오는 작업 패널 | [Sheet](sheet.md) |
| 짧은 확인·결정 | [AlertDialog](alert-dialog.md), [Dialog](dialog.md) |
| 항상 보이는 앱 왼쪽 내비게이션 | [Sidebar](sidebar.md) |
| 트리거 옆 작은 내용 | [Popover](popover.md) |
| 고정 2단 배치(크기 조절) | [Splitter](splitter.md), [Layout](layout.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SidePanel` | 기본 | `@hjmds/react`, `/side-panel` | — (계약상 unsupported) |

## 최소 사용 예

```tsx
// Web — 모달(기본)
import { Button } from "@hjmds/react/actions";
import { SidePanel } from "@hjmds/react/side-panel";

<SidePanel open={open} onOpenChange={(next) => setOpen(next)}
  title={t("orders.filter.title")} closeLabel={t("common.close")}
  footer={<Button onClick={apply}>{t("orders.filter.apply")}</Button>}>
  <OrderFilters value={draft} onChange={setDraft} />
</SidePanel>
```

```tsx
// Web — 비모달: 뒤 목록을 계속 조작
import { SidePanel } from "@hjmds/react/side-panel";

<SidePanel open={open} onOpenChange={(next) => setOpen(next)} edge="end" size="wide"
  title={t("orders.detail.title")} closeLabel={t("common.close")}
  dismissPolicy={{ modal: false, dismissible: true, dismissWhileBusy: false, escapeDismiss: true }}>
  <OrderDetail id={selectedId} />
</SidePanel>
```

Native: 없음. Native는 [Sheet](sheet.md)를 쓴다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `edge` | `start` · `end` | `end` | 논리 방향이라 RTL에서 뒤집힌다 |
| `size` | `compact` 320 · `regular` 400 · `wide` 560 | `regular` | 패널 폭 |
| `dismissPolicy` | 전체 객체 `{ modal: true, dismissible, dismissWhileBusy, escapeDismiss, outsideDismiss }` 또는 `{ modal: false, dismissible, dismissWhileBusy, escapeDismiss }` | `{ modal: true, dismissible: true, dismissWhileBusy: false, escapeDismiss: true, outsideDismiss: true }` | `Partial`이 아니라 전체 객체를 넘긴다. `modal: false`에는 `outsideDismiss`를 쓸 수 없다(타입 오류) |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | 제어하면 `onOpenChange` 필수, 비제어면 `trigger` 필수 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | reason: `trigger` · `close-action` · `escape` · `outside` · `programmatic` |
| `onDismissComplete` | `(detail: { reason }) => void` | — | 패널이 실제로 사라진 뒤 닫힘마다 한 번 |
| `title` · `closeLabel` | 문구 | 필수 | `title`은 `ReactNode`, `closeLabel`은 `string` |
| `busy` | `boolean` | `false` | 사용자 닫기를 막는다 |
| `modalPriority` | 숫자 | `0` | 모달 스택 순서 |
| `description` · `footer` | `ReactNode` | — | `footer`는 스크롤 밖 하단 고정. 적용·저장 행동은 여기 |
| `initialFocusRef` · `returnFocusRef` | `RefObject<HTMLElement \| null>` | — | 열릴 때·닫힐 때 포커스 |
| `portalContainer` · `className` | `HTMLElement` · 문자열 | — | `layoutStyle`은 받지 않는다(Web 제외 15개 중 하나). 폭은 `size`, 위치는 `edge` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이 화면 전체(`100dvh`), 폭 `size`(`compact` 320 · `regular` 400 · `wide` 560), radius 0으로 가장자리에 붙는다. 머리 최소 높이 44(`control.minTouchTarget`) | `sidePanelRecipe.sizes`·`content.radius`·`header`, `.hjm-side-panel` |
| 간격 | 머리 위 `spacing.sm` 12 · 좌우 `spacing.lg` 20, 제목–닫기 `spacing.md` 16. 본문 좌우 `spacing.lg` 20 · 상하 `spacing.md` 16, 자식 간격 `spacing.md` 16. footer 위 `spacing.sm` 12 · 좌우 20, 버튼 사이 `spacing.sm` 12 | `.hjm-side-panel__header`·`__body`·`__footer` |
| 순서·정렬 | `edge` 쪽 가장자리. 머리(제목·설명 + 끝 쪽 닫기) → 본문 → `footer`. footer는 오른쪽 정렬 가로 줄 [보조][주] | `.hjm-side-panel-positioner`, `.hjm-side-panel__footer` |
| 고정·스크롤 | 본문만 스크롤, 머리·footer 고정. footer 아래 여백 `max(spacing.sm 12, 아래 안전 영역)`. 비모달은 scrim 없이 `position: fixed`로 떠서 뒤 페이지 일부를 덮는다. 가려지면 안 되면 [Layout](layout.md)·[Splitter](splitter.md)로 고정 2단 | `.hjm-side-panel[data-modal="false"]` |
| 좁은 폭·큰 글자 | 폭이 패널보다 좁으면 화면 폭 전체(`min(size, 100%)`). footer는 줄을 바꾼다. 모바일 폭이 주 대상이면 [Sheet](sheet.md) | `.hjm-side-panel` |

```text
edge="end", 모달                             비모달: scrim 없음, 뒤 페이지 조작 가능
┌──────────────────────┬───────────────┐    ┌──────────────────────┬───────────────┐
│ (scrim, 누르면 닫힘)  │ 제목      [×] │←고정│ 목록(조작 가능)      │ 상세      [×] │
│                      │───────────────│    │                      │───────────────│
│                      │ 본문 ↕ 스크롤  │    │                      │ 본문 ↕        │
│                      │───────────────│    │                      │               │
│                      │ [취소] [적용] │←고정│                      │               │
└──────────────────────┴───────────────┘    └──────────────────────┴───────────────┘
                        ← size 320/400/560 →
```

## 꼭 지킬 것

- 모달 SidePanel은 Dialog·Sheet와 같은 모달 스택에 들어간다. 제품이 따로 focus trap·스크롤 잠금을 얹지 않는다.
- 비모달은 backdrop이 없고 Escape는 패널 안에서만 듣는다. 닫기 수단(닫기 버튼·Escape)을 막지 않는다.
- 저장 중에는 `busy`로 사용자 닫기를 막는다. owner가 `open=false`로 닫는 것은 항상 허용된다(`programmatic`).
- 문구(`title`, `closeLabel`)는 i18n 키로 넣는다. 폭·radius·색을 `className`으로 덮지 않는다. 폭은 `size`로 고른다.
