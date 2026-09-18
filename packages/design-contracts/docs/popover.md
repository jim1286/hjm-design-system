# Popover contract

## 문제

트리거에 붙어 뜨는 표면 중, plain text 보충 설명(Tooltip)도 아니고 항목 목록
(Menu)도 아닌 **임의의 interactive 콘텐츠**(작은 폼, 링크가 섞인 본문, 여러
control이 섞인 레이아웃)를 보여줘야 하는 자리가 있다. `docs/dropdown.md`가
이미 이 문제를 `Popover`의 이름표로 예약해 두었다 — Dropdown을 "임의 콘텐츠"용
으로 다시 정의하는 대신, 그 문제를 여기서 계약한다.

## Tooltip · Menu · Popover 삼각 경계 (판정)

세 컴포넌트는 모두 "트리거에 붙는 floating surface"라는 같은 anatomy를 공유하지만
콘텐츠 종류와 focus 계약이 다르다.

| | Tooltip | Menu | Popover |
| --- | --- | --- | --- |
| 콘텐츠 | 현지화된 plain text 한 문장 | stable id를 가진 action/선택 항목 목록 | 임의의 interactive 콘텐츠(폼, 링크, 혼합 레이아웃) |
| focus가 surface 안으로 들어가는가 | **아니오** — `docs/tooltip.md`: "tabbable descendant가 없다" | 예 — 항목에 roving/activate focus | **예** — 결정적 차이 |
| dismiss 계기 | hover/focus 해제, Escape, sibling 전환 | 선택, Escape/back, outside | close action, outside pointer, **outside-focus**(Tab이 surface 밖으로 나감), Escape |
| trigger 상호작용 | hover(지연) + focus(즉시) | click/Enter/Space로 열림, 방향키로 탐색 | **click/Enter/Space만** — content가 interactive라 hover로 열고 hover로 유지하는 Tooltip 모델을 재사용하면 키보드·터치 사용자가 content에 도달하기 전에 닫히는 경쟁이 생긴다 |
| positioning | 제품 renderer의 비공개 `AnchoredOverlay` | 같은 anatomy(`menuRecipe`)가 이미 소유 | Tooltip과 동일하게 비공개 `AnchoredOverlay`에 위임 — 새 portal/flip/shift API를 만들지 않는다 |

`docs/tooltip.md`가 그은 경계("interactive Popover로 확장하지 않는다")를
Popover가 정확히 이어받는다 — Tooltip이 멈춘 자리에서 focus가 surface 안으로
들어가는 순간 계약이 달라지고, 그 한 가지 사실에서 나머지 전부(비-hover
트리거, 명시적 dismiss 어휘, focus 복귀)가 따라 나온다.

Menu와 구분되는 지점은 콘텐츠 형태다. Menu는 Collection 기본 계약(stable id,
label/textValue, selection mode)을 따르는 항목 **목록**이고 그 role/keyboard
표는 `behaviorRegistry.menu`가 이미 완결했다. Popover는 그 계약을 만족하지
않는, 목록이 아닌 콘텐츠를 위한 자리다. 제품이 실제로 액션 목록을 띄우려는
것이라면 그것은 Popover가 아니라 Menu다.

## ConfirmPopover는 작동하는 조합으로 제공한다

catalog에 별도 `planned` 항목으로 있는 `ConfirmPopover`(antd `Popconfirm`,
`relationship: "adapted"`)는 이 Popover 위의 **조합**이다 — Popover의 anchored
비모달 surface에 되돌릴 수 있는 행동의 확인·취소를 얹은 조합이다. 파괴적 동작은
AlertDialog를 사용한다. `Patterns/Popover/ReversibleConfirmation`은 기록 보관·취소가
작동하는 예제이며 새 독립 renderer 수에 더하지 않는다.

## 일반화한 계약

### Open state

`PopoverOpenState`는 Tooltip과 같은 `open`/`defaultOpen`/`onOpenChange`
discriminated union이다. `onOpenChange`는 `reason`을 `trigger` 또는
구체적인 dismiss reason 중 하나로 보고한다 — Sheet가 dismiss reason을 추측하지
않고 값으로 보고하는 것과 같은 이유(`SheetOpenChangeDetails`).

### Dismiss 어휘와 정책

`PopoverDismissReason`은 `close-action | outside-pointer | outside-focus |
escape | programmatic`이다. `SheetDismissReason`과 다른 점 둘:

- `back`/`swipe`가 없다 — Popover는 web 전용이고 native 뒤로가기·스와이프
  표면이 아니다.
- `outside-pointer`와 `outside-focus`를 분리한다 — Popover는 Dialog/Sheet처럼
  모달이 아니므로 Tab이 surface 밖으로 정당하게 나갈 수 있고, 그 키보드
  이탈은 포인터로 바깥을 클릭하는 것과 다른 입력 양식이라 정책으로 따로
  켜고 끌 수 있어야 한다.

`PopoverDismissPolicy`는 `dismissible`, `outsideDismiss`, `escapeDismiss`,
`focusOutDismiss` 네 값이다. `busy` 축은 없다 — Sheet/AlertDialog와 달리
Popover는 모달이 아니라 "모든 dismiss를 막는 전역 상태"가 성립하지 않는다.
콘텐츠 안의 폼이 제출 중 Escape를 무시하고 싶다면 그것은 콘텐츠 레벨의
판단이지 Popover 계약의 축이 아니다. `canDismissPopover`는 `canDismissSheet`와
같은 모양으로 controlled owner의 `programmatic` 닫힘은 항상 허용한다.

### Positioning은 소유하지 않는다

`docs/tooltip.md`의 "Positioning boundary"를 그대로 재사용한다. HJM은
preferred placement(`top|bottom|start|end`), align(`start|center|end`),
arrow 크기, spacing, collision padding, motion만 소유한다. DOM 측정, portal,
flip/shift, RTL 논리 방향 변환은 제품 Web renderer의 비공개 `AnchoredOverlay`가
소유하며 이 모듈은 그 도구를 공개 API로 노출하지 않는다 — Tooltip이 세운
"이 내부 도구를 catalog의 public Popover로 노출하지 않는다"는 경계를 Popover
자신이 어기지 않는다.

## HJM 기본값

- `placement` 기본값 `bottom`, `align` 기본값 `start` — Tooltip(`top`/`center`)
  과 의도적으로 다르다. Popover 콘텐츠는 Menu처럼 아래로 펼쳐지는 목록형
  레이아웃을 담는 경우가 많아 Menu의 시각적 관성(아래로 열림)에 더 가깝다.
- `accessibilityLabel`은 선택 사항이다. 대부분의 Popover 콘텐츠는 자체 heading을
  가지므로 renderer가 `aria-labelledby`로 제목을 연결한다. heading 존재만으로 dialog가
  자동으로 이름을 얻지는 않는다. heading이 없는 콘텐츠만
  명시적으로 공급한다 — 기본값을 발명하지 않는다(Tooltip이 `content`를 필수로
  요구하는 것과 반대로, Popover는 콘텐츠 자체를 타입으로 갖지 않으므로 대신
  이 escape hatch만 둔다).
- trigger는 click/Enter/Space로만 연다. hover는 열지 않는다 — 위 삼각 경계
  표의 이유와 동일하다.

## 플랫폼 번역

- Web: surface는 `role="dialog"`(비모달, `aria-modal` 없음), trigger는
  `aria-haspopup="dialog"`와 `aria-expanded`를 합성한다. 열릴 때 초기 focus는
  콘텐츠의 첫 focusable 요소로 이동하고(없으면 콘텐츠 root, `tabIndex={-1}`),
  Escape·명시적 닫기 후 초점은 trigger로 복귀한다. outside pointer·Tab 이동은 새로 옮긴
  초점을 유지한다. 기존 문서는 모든 종료 후 복귀를 요구했지만, 실제 Web 구현에서
  다음 입력으로 가려는 행동을 끊는 문제가 있어 2026-09-16 수정했다.
- Native: 이 컴포넌트는 `platform: web`이다 — `docs/expansion-roadmap.md`
  Batch 3에 `web`으로만 분류되어 있고, Native adaptive 대응(예: bottom sheet로
  펼치는 대안)이 필요해지면 그때 별도 적응 계약을 연다.
- Reduce Motion: Tooltip과 같은 enter/exit preset(`motionPreset.enter/exit`)을
  사용한다. 진입/종료는 이동 없는 opacity이며 reduced motion의 종료는 즉시 제거한다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `open` (controlled/uncontrolled) | 공개 |
| dismiss reason(`close-action`/`outside-pointer`/`outside-focus`/`escape`/`programmatic`) | 공개 |
| `placement`/`align` | 공개(Tooltip과 같은 값 집합) |
| `busy`(모든 dismiss 차단) | **배제** — 비모달이라 전역 차단 상태가 성립하지 않는다 |
| hover trigger | **배제** — focus가 콘텐츠 안으로 들어가는 계약과 hover 열기/유지가 경쟁한다 |
| portal/flip/shift 공개 API | **배제** — Tooltip의 `AnchoredOverlay` 경계를 그대로 상속 |
| content 데이터 모델 | **배제** — 런타임 의존성 금지 원칙상 React 콘텐츠 타입을 이 패키지가 가질 수 없다. 콘텐츠 자체는 항상 제품/렌더러 소유다 |

## 공개 API와 예제

`import { Popover } from "@hjmds/react/popover"`로 가져온다. 필수 props는 `trigger`,
`title`, `closeLabel`이다. trigger는 ref와 button props를 DOM까지 전달하는 단일 버튼이다.
children은 React 콘텐츠 또는 `({ close }) => ...` 함수이며 close는 `close-action`을 요청한다.
`open/defaultOpen/onOpenChange`, `descriptor`, `dismissPolicy`, `initialFocusRef`,
`portalContainer`, `description`을 제공한다. ref는 content div를 가리킨다.

공개 위치 설정은 기존 descriptor의 placement/align이다. 내부 `useAnchoredPopup`이 portal·
flip·shift를 담당하고, 옆 공간이 부족한 넓은 콘텐츠는 block 축으로 옮긴다. 크기는 recipe의
240–360px을 기준으로 viewport에 제한하고 긴 콘텐츠는 내부 스크롤한다. 내부 API는 공개하지 않는다.

초기 focus는 지정된 ref, 본문의 첫 tabbable control, content root 순서다. 닫기 버튼을
무조건 첫 초점으로 고르지 않는다. Tab 경계는 portal의 body 끝 위치 대신 트리거 다음
입력으로 이어진다. 현재 초점이 다른 제어 요소로 이동했다면 종료 효과가 다시 뺏지 않는다.
닫히는 표면은 즉시 inert/aria-hidden이 되고 exit 후 제거된다. nested Popover의 portal도 함께
닫히며, 내부 Menu/Select portal은 바깥 클릭·초점으로 오인하지 않는다.

Dialog 안의 Popover는 첫 Escape를 소유한다. 내부 Menu가 Escape를 처리했다면 부모는
그 이벤트를 다시 처리하지 않는다. 모달의 초점 목록은 hidden/inert/disabled 자손을 제외한다.

2026-09-16 사용자의 확장 요청으로 라이브러리 beta를 제공한다. 제품 채택은 별도다.
`Patterns/Popover/Filters`는 제목·즐겨찾기 조건 적용/취소/초기화와 실제 목록 교체를 제공한다.
`ReversibleConfirmation`은 보관 후 취소 버튼으로 초점을 옮기며 실제로 복원한다.

[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover)의 비모달 focus·
종료 구분과 [React Aria Popover](https://react-aria.adobe.com/Popover)의 viewport/portal 경계를
비교했다. [Ant Design Popconfirm](https://ant.design/components/popconfirm/)의 확인/취소 흐름은
되돌릴 수 있는 제품 행동의 조합에 적용한다. API 호환을 약속하지 않는다.

브라우저 검증은 초기 focus, Escape 복귀, 바깥 클릭 유지, Tab 양방향 이탈, controlled 거절 후
재시도, dismiss 정책, 중첩 modal/menu, 320px·2배 글자·RTL·충돌 배치, exit 격리를 다룬다.
제품 채택·실제 보조기기 검증은 남아 있다.
