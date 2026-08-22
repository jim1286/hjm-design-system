# Tooltip contract

`Tooltip`은 Web에서 이미 의미와 focus를 가진 interactive trigger에 짧은 보충 설명을
제공합니다. 중요한 정보, 오류, 행동, link를 Tooltip 안에 숨기지 않으며 Native에 억지로
동일한 hover UI를 만들지 않습니다. BurnTok Web renderer와 실제 알림 trigger에서 아래
수명주기·RTL·접근성 계약을 검증했으므로 catalog는 `web / beta`입니다.

## Public descriptor

- `content`는 현지화된 non-empty plain string입니다. `ReactNode`, HTML, button, link는
  허용하지 않습니다.
- `placement`는 logical `top | bottom | start | end`, `align`은
  `start | center | end`입니다. renderer가 collision 때문에 실제 side를 바꿀 수 있습니다.
- controlled/uncontrolled open state는 `open/defaultOpen/onOpenChange` discriminated union을
  사용합니다. `onOpenChange` reason은 pointer, focus, leave, blur, Escape, trigger activation,
  다른 Tooltip 열림을 구분합니다.
- trigger는 단일 interactive element입니다. Tooltip이 role, tabIndex, accessible name을
  발명하지 않고 기존 ref/event/`aria-describedby`를 합성합니다.

## Timing and provider

- keyboard focus는 즉시 열고 pointer는 500ms 뒤 엽니다. touch hover는 무시합니다.
- 최근 Tooltip이 닫힌 뒤 300ms 동안 sibling Tooltip은 즉시 열립니다.
- Provider 안에서는 한 번에 하나만 보입니다. controlled owner가 close 요청을 거부해도 두
  surface를 동시에 노출하지 않습니다.
- trigger와 Tooltip surface 중 하나라도 hover된 동안 유지합니다. 둘 사이를 대각선으로
  이동하는 pointer corridor도 일시적인 leave로 닫지 않습니다.
- Escape는 닫고 trigger focus를 유지합니다. 같은 hover/focus 자극이 계속 남아 있어도
  해당 입력이 한 번 완전히 해제되기 전에는 다시 열지 않습니다.
- trigger activation은 Tooltip만 닫고 원래 click을 취소하지 않습니다.

## Accessibility

- surface는 `role="tooltip"`, trigger는 surface ID를 기존 설명 ID와 함께
  `aria-describedby`로 참조합니다.
- Tooltip은 focus를 받지 않고 tabbable descendant가 없습니다.
- 보충 설명만 제공하므로 trigger의 accessible name과 핵심 결과는 Tooltip 없이도
  이해할 수 있어야 합니다.
- hover/focus로 나타난 내용은 dismissible, hoverable, persistent 조건을 모두 만족합니다.

## Positioning boundary

HJM은 preferred placement, arrow, spacing, collision padding, layer, motion만 소유합니다.
DOM 측정·portal·`visualViewport`·scroll ancestor·ResizeObserver·pointer grace polygon은 Web
renderer의 비공개 AnchoredOverlay가 소유합니다. 이 내부 도구는 role, focus, dismiss, content
anatomy를 알지 못하며 catalog의 public Popover로 노출하지 않습니다.

초기 측정 전 surface는 숨기고 detached anchor는 렌더링하지 않습니다. logical start/end는
RTL에서 변환하고 preferred side가 부족하면 opposite side로 flip한 뒤 cross-axis를 viewport
안으로 shift합니다. Reduce Motion에서는 transform 없이 exit를 정확히 한 번 완료합니다.

## 첫 제품 검증

첫 적용은 BurnTok Web `NotificationBell`입니다. 브라우저 `title`을 제거하고 기존
`AppIconButton`을 trigger로 유지해 hover/focus/Escape, controlled owner 거부, sibling
skip-delay/FIFO, detached anchor, 우상단 viewport flip·shift, trigger-local 및 runtime RTL을
검증했습니다. rename hint는 클릭 가능한 span을 실제 button으로 고친 뒤 두 번째 slice로
옮깁니다. `iframe title`처럼 접근성 이름인 속성은 Tooltip으로 바꾸지 않습니다.
