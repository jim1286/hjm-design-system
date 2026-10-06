# Tour 사용 지침

적용: `@hjmds/react` 1.12.1(Native 없음) · 검토일: 2026-10-06 ·
계약: [Tour](../tour.md), recipe `tourRecipe`(`src/tour.ts`)

## 언제 쓰나

새 화면·새 기능을 처음 만난 사용자에게 화면의 여러 요소를 순서대로 짚어 설명할 때 쓴다.
카드가 대상 요소 옆에 붙고, 배경은 가려지며, 다음·이전·건너뛰기·완료로 진행한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 요소 하나에 대한 짧은 설명 | [Tooltip](tooltip.md), [Popover](popover.md) |
| 사용자가 직접 진행하는 다단계 입력 흐름 | [Steps](steps.md) |
| 첫 실행 소개 화면 묶음 | [OnboardingScreen](onboarding-screen.md) |
| 한 번에 하나의 내용을 띄움 | [Dialog](dialog.md), [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Tour` | `@hjmds/react`, `/tour` | 없음 | 기본 |

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
  resolveAnchor={(id) => document.querySelector(`[data-tour="${id}"]`)}
  composeAnnouncement={({ position, total, title, description }) =>
    t("tour.announce", { position, total, title, description })}
  onStepChange={(id) => setStepId(id)}
  open={open}
  onOpenChange={(next, { reason }) => { setOpen(next); if (!next) saveTourSeen(reason); }}
/>
```

Native renderer는 없다. Native에서 Tour를 흉내 내 조립하지 않는다.

## 축과 기본값

- 진행 위치는 `descriptor.currentStepId` 하나다. 다음·이전을 누르면 `onStepChange(id, reason)`만
  호출되므로 제품이 상태를 갱신해야 카드가 움직인다.
- 열림: `open`+`onOpenChange`(제어, 둘 다 필수) 또는 `defaultOpen`(비제어, 기본 `false`). 둘을 섞으면 예외다.
- 닫힘 사유: `skip` · `escape` · `complete` · `programmatic` · `interrupted`. 바깥 클릭으로는 닫히지 않는다.
- step의 `placement`: `top`·`bottom`·`start`·`end`, `align`: `start`·`center`·`end`(생략 시 자동 배치).
- `trigger`(요소 하나)를 주면 그 요소가 여는 버튼이 되고, 닫힐 때 포커스가 그리로 돌아간다.

## 꼭 지킬 것

- `anchorId`는 제품이 소유한 불투명 키다. ref·좌표를 넘기지 않고 `resolveAnchor`가 요소를 찾는다.
  같은 요소를 두 step에서 설명해도 된다(id만 유일하면 된다).
- `composeAnnouncement`는 위치·제목·설명을 담은 문장을 i18n으로 조립해 반환한다. 빈 문자열이면 예외다.
  화면의 카드 문구는 보조기술에서 숨겨지고 이 문장만 읽힌다.
- step `title`·`description`, `labels`의 네 값은 모두 비어 있으면 안 된다.
- 다시 보지 않기 같은 "본 적 있음" 저장은 제품 몫이다. `onOpenChange`의 `reason`으로 판단한다.

## 함정

- 첫 step의 이전 버튼은 `disabled`로 그려진다. `tour.tsx`의 주석은 계약대로 "포커스 가능한 no-op"이라고
  적지만 실제 버튼은 비활성이라 포커스를 받지 않는다.
- 열린 채로 언마운트되면 `onOpenChange(false, { reason: "interrupted" })`가 한 번 온다. 라우트 이동을
  완료로 기록하지 않도록 사유를 구분한다.
