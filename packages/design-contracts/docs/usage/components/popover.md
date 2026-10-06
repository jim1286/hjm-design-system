# Popover

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Popover](../../popover.md), [ConfirmPopover 조합](../../confirm-popover.md), `src/popover.ts`(`popoverRecipe`)
- 스토리북: `배포/컴포넌트/오버레이/팝오버`

## 언제 쓰나

트리거에 붙어 뜨는 비모달 표면 안에 **포커스를 받는 임의 콘텐츠**를 둘 때 쓴다.
작은 폼, 링크가 섞인 설명, 여러 control이 섞인 필터 묶음, 되돌릴 수 있는 행동의 짧은 확인이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| stable id를 가진 action·선택 항목 목록 | [Menu](menu.md) |
| 포커스가 들어가지 않는 한 문장 보충 설명 | [Tooltip](tooltip.md) |
| 되돌릴 수 없는 파괴적 행동의 확인 | [AlertDialog](alert-dialog.md) |
| 사용자가 반드시 응답해야 하는 모달 작업 | [Dialog](dialog.md) |
| Native 앱의 같은 자리 | [Sheet](sheet.md) (Popover는 Web 전용) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Popover` | 기본 | `@hjmds/react`, `/popover` | — |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Popover } from "@hjmds/react/popover";

<Popover
  trigger={<Button tone="secondary">{t("filter.open")}</Button>}
  title={t("filter.title")}
  closeLabel={t("common.close")}
  descriptor={{ placement: "bottom", align: "start" }}
>
  {({ close }) => <FilterForm onApply={() => { apply(); close(); }} />}
</Popover>
```

Native 예는 없다(renderer 없음).

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `trigger` | 요소 하나 | 필수 | 여는 버튼. Popover가 ref·aria 속성을 붙인다 |
| `title` · `closeLabel` | 문자열 | 필수 | 비면 던진다 |
| `description` | 문자열 | — | 제목 아래 설명 |
| `children` | 노드 또는 `(actions: { close(): void }) => ReactNode` | — | 콘텐츠 안에서 닫을 때 함수형을 쓴다 |
| `openOn` | `press` · `hover` | `press` | `hover`는 지연된 포인터 진입(열기 300ms·닫기 150ms)을 **더할** 뿐이고 click/Enter/Space 경로는 그대로다 |
| `descriptor` | `{ placement?, align?, accessibilityLabel? }` | — | |
| `descriptor.placement` | `top` · `bottom` · `start` · `end` | `bottom` | |
| `descriptor.align` | `start` · `center` · `end` | `start` | |
| `dismissPolicy`(부분 지정) | `{ dismissible?, outsideDismiss?, escapeDismiss?, focusOutDismiss? }`(`boolean`) | 모두 `true` | |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | 제어하면 `onOpenChange` 필수 |
| `onOpenChange` | `(open: boolean, details: { reason }) => void` | — | `reason`: `trigger` · `close-action` · `outside-pointer` · `outside-focus` · `escape` · `programmatic` |
| `initialFocusRef` | `RefObject<HTMLElement \| null>` | 첫 포커스 가능 요소 | 열릴 때 처음 포커스 |
| `portalContainer` | `HTMLElement` | `document.body` | 표면을 붙일 곳 |
| `className` | 문자열 | — | `layoutStyle`은 받지 않는다(아래 함정) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 기본 360(`popoverRecipe.maxWidth`), 화면이 좁으면 최소 240(`minWidth`)까지 줄어든다. radius `radius.md` 12 | `popoverRecipe`, `src/popover.tsx` |
| 간격 | 트리거와 8(`sideOffset` = `spacing.xs`), 화면 가장자리 8(`collisionPadding` = `spacing.xs`). 안쪽 `spacing.sm` 12. 제목·닫기 사이 8, 설명 위 8 · 아래 16, 본문 위 8 | `popoverRecipe`, `.hjm-popover*` |
| 순서·정렬 | 기본 `placement="bottom"` `align="start"`. 안쪽은 제목과 닫기(`ghost`)가 한 줄 양 끝 → 설명 → 본문. 본문 행동은 끝 정렬, 보조 → 주([Button](button.md)) | `popoverDescriptorDefaults`, `.hjm-popover__header` |
| 고정·스크롤 | 트리거에 붙는 portal(`layer.dropdown` 400; 모달 내부는 소유 모달 + 1). 공간이 모자라면 반대쪽으로 뒤집고 그래도 안 되면 다른 축으로 옮긴다(`fallbackAxis`). 넘치는 내용은 표면 안 스크롤 | `src/popover.tsx`, `useAnchoredPopup` |
| 좁은 폭·큰 글자 | 제목 줄은 좁으면 감긴다. 폭은 240까지만 줄고 화면 안으로 제한된다 | `.hjm-popover__header`, `src/popover.tsx` |

계약에는 화살표(`arrow` 4) 슬롯이 있지만 현재 Web renderer는 화살표를 그리지 않는다.

```text
 [필터 ▾]  ← 트리거
    ↓ 8
 ┌──────────────────────────────┐
 │ 필터            [닫기]       │ ← 제목·닫기(ghost)
 │ 설명 문구                    │
 │ ─ 본문(스크롤) ───────────── │
 │ ☐ 옵션 A                     │
 │ ☐ 옵션 B                     │
 │              [초기화] [적용] │ ← 보조 → 주
 └──────────────────────────────┘
   240 ~ 360, 화면 가장자리 8
```

## 꼭 지킬 것

- `title`과 `closeLabel`은 비어 있으면 안 된다(던진다). 둘 다 i18n 키로 넣는다.
- 행동 목록을 띄우려는 것이면 Popover가 아니라 Menu다. Popover 안에 menuitem 목록을 직접 만들지 않는다.
- 처음 포커스 대상을 바꿔야 하면 `initialFocusRef`를 쓴다.
- 콘텐츠 안에서 닫기는 children 함수 인자의 `close()`로 한다.
- `className`은 배치에만 쓴다. 표면의 색·radius·그림자를 덮지 않는다.

## 함정

- Popover는 `layoutStyle`을 받지 않는다(Web `layoutStyle` 제외 15개 중 하나). 렌더하는 것이 제품 trigger와 떠 있는 portal뿐이라
  배치는 trigger 쪽(또는 감싼 요소)에서 한다.
- 부모 Popover가 닫히면 안에 중첩된 Popover도 닫히고 `onOpenChange(false, { reason: "programmatic" })`가 온다. 제어형이면 이 reason도 처리한다.
