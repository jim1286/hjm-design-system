# Tour

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Tour](../../tour.md), `src/tour.ts`(`tourRecipe`)
- 스토리북: `배포/컴포넌트/오버레이/사용 안내 둘러보기`

## 언제 쓰나

새 화면·새 기능을 처음 만난 사용자에게 화면의 여러 요소를 순서대로 짚어 설명할 때 쓴다.
카드가 대상 요소 옆에 붙고, 배경은 가려지며, 다음·이전·건너뛰기·완료로 진행한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 요소 하나에 대한 짧은 설명 | [Tooltip](tooltip.md), [Popover](popover.md) |
| 사용자가 직접 진행하는 다단계 입력 흐름 | [Steps](steps.md) |
| 한 번에 하나의 내용을 띄움 | [Dialog](dialog.md), [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Tour` | 기본 | `@hjmds/react`, `/tour` | — |

descriptor 타입은 `@hjmds/design-contracts/components/tour`에 있다.

## 최소 사용 예

```tsx
// Web
import { Tour } from "@hjmds/react/tour";

<Tour
  descriptor={{
    accessibilityLabel: t("tour.home.label"),
    currentStepId: stepId,
    steps: [
      { id: "search", anchorId: "home-search", title: t("tour.search.title"), description: t("tour.search.body") },
      { id: "new", anchorId: "home-new", title: t("tour.new.title"), description: t("tour.new.body"), placement: "top" },
    ],
    labels: { next: t("tour.next"), previous: t("tour.previous"), skip: t("tour.skip"), done: t("tour.done") },
  }}
  resolveAnchor={(id) => document.querySelector<HTMLElement>(`[data-tour="${id}"]`)}
  composeAnnouncement={({ position, total, title, description }) =>
    t("tour.announce", { position, total, title, description })}
  onStepChange={(id) => setStepId(id)}
  open={open}
  onOpenChange={(next, { reason }) => { setOpen(next); if (!next) saveTourSeen(reason); }}
/>
```

Native: 없음. Native에서 Tour를 흉내 내 조립하지 않는다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel, currentStepId, steps: readonly { id, anchorId, title, description, placement?, align? }[], labels: { next, previous, skip, done } }` | — (필수) | 문자열은 모두 비어 있으면 안 된다 |
| `descriptor.currentStepId` | step id | — | 진행 위치는 이것 하나다. 다음·이전을 누르면 `onStepChange`만 호출되므로 제품이 상태를 갱신해야 카드가 움직인다 |
| `onStepChange` | `(stepId: Id, reason: "next" \| "previous") => void` | — (필수) | 이동할 step id |
| `resolveAnchor` | `(anchorId: string) => HTMLElement \| null` | — (필수) | 대상 요소를 찾는다 |
| `composeAnnouncement` | `(info: { position: number, total: number, title: string, description: string }) => string` | — (필수) | 보조기술이 읽는 단계 문장 |
| `open` + `onOpenChange` | 제어(둘 다 필수) | — | `defaultOpen`과 섞으면 예외 |
| `defaultOpen` | `boolean` | `false` | 비제어 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | `reason`은 열림 `trigger`, 닫힘 `skip` · `escape` · `complete` · `programmatic` · `interrupted`. 바깥 클릭으로는 닫히지 않는다 |
| step `placement` | `top` · `bottom` · `start` · `end` | 자동 배치 | — |
| step `align` | `start` · `center` · `end` | 자동 배치 | — |
| `trigger` | `ReactElement` 하나 | — | 그 요소가 여는 버튼이 되고, 닫힐 때 포커스가 그리로 돌아간다 |
| `portalContainer` | `HTMLElement` | `document.body` | — |

`layoutStyle`은 없다. 화면 흐름 밖 오버레이라 배치할 루트가 없다(`className`만 카드에 붙는다).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 카드 최대 폭 320, 안쪽 여백 `spacing.md` 16, 모서리 `radius.md` 12. 뷰포트 높이를 넘으면 카드 안에서 세로 스크롤. 버튼은 Button `medium` 44 | `tourRecipe.maxWidth`, `.hjm-tour` |
| 간격 | 카드–대상 요소 `spacing.xs` 8. 카드 안 블록 사이 `spacing.sm` 12, 제목 위 `spacing.xxs` 4, 설명 위 `spacing.xs` 8, 행동 사이 `spacing.xs` 8 | `tourRecipe.sideOffset`, `.hjm-tour__*` |
| 순서·정렬 | 카드 안: 진행 수(`1 / 3`) → 제목 → 설명 → 행동 줄. 행동 줄은 끝 정렬, **[건너뛰기 ghost] [이전 secondary] [다음·완료 primary]** | `react/src/tour.tsx`, `.hjm-tour__actions` |
| 고정·스크롤 | 화면 전체를 덮는 오버레이. 배경막(`backdrop.modal`)이 뷰포트 전체에 깔리고 대상 요소 둘레에 강조 테두리(focus 색 2px, `radius.md` 12). 카드는 portal로 떠서 모달 층 바로 위. 대상 요소는 스크롤해서 화면 안에 보이게 두고, 고정 바 아래 가려진 요소를 대상으로 삼지 않는다 | `.hjm-tour-backdrop`, `.hjm-tour-highlight`, `getModalLayer(0) + 1` |
| 좁은 폭·큰 글자 | 카드가 `placement` 쪽에 자리가 모자라면 반대 축으로 옮겨진다. 행동 줄은 좁으면 줄바꿈 | `useAnchoredPopup`(`fallbackAxis`), `.hjm-tour__actions`(flex-wrap) |

```text
┌──────────── 배경막(전체) ─────────────┐
│   ┌─────────┐ ← 대상 강조 테두리       │
│   │ 검색     │                          │
│   └─────────┘                          │
│        ↕ spacing.xs 8                   │
│   ┌──────────────────────────┐ ≤ 320  │
│   │ 1 / 3                     │        │
│   │ 제목                      │        │
│   │ 설명                      │        │
│   │ [건너뛰기] [이전] [다음]  │        │
│   └──────────────────────────┘        │
└────────────────────────────────────────┘
```


## 꼭 지킬 것

- `anchorId`는 제품이 소유한 불투명 키다. ref·좌표를 넘기지 않고 `resolveAnchor`가 요소를 찾는다.
  같은 요소를 두 step에서 설명해도 된다(id만 유일하면 된다).
- `composeAnnouncement`는 위치·제목·설명을 담은 문장을 i18n으로 조립해 반환한다. 빈 문자열이면 예외다.
  화면의 카드 문구는 보조기술에서 숨겨지고 이 문장만 읽힌다.
- step `title`·`description`, `labels`의 네 값은 모두 비어 있으면 안 된다.
- 다시 보지 않기 같은 "본 적 있음" 저장은 제품 몫이다. `onOpenChange`의 `reason`으로 판단한다.
- 첫 step의 이전 버튼은 `aria-disabled`다. 포커스는 받고(카드 안 탭 순서 유지) 눌러도 아무 일도 없다.
  제품이 첫 step에서 이전 버튼을 숨기거나 `disabled`로 바꾸지 않는다.

## 함정

- 열린 채로 언마운트되면 `onOpenChange(false, { reason: "interrupted" })`가 한 번 온다. 라우트 이동을
  완료로 기록하지 않도록 사유를 구분한다.
