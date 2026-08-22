# Tour contract

## 문제

새 화면·새 기능을 처음 마주친 사용자에게 화면의 여러 요소를 순서대로 짚어가며
"이건 이렇게 씁니다"를 설명한다. antd `Tour`가 이 문제를 커버한다.

## 대체재가 없다 (판정)

이 담당분의 다른 둘(FloatingActionButton, ConfirmPopover)과 달리, Tour가 푸는
문제는 이 저장소의 다른 어떤 컴포넌트로도 이미 완결돼 있지 않다. Popover는 클릭
한 번으로 여는 임의 콘텐츠이지 순서가 있는 다단계 설명이 아니고, Steps는 사용자가
이미 진행 중인 자기 자신의 흐름(온보딩 마법사)을 보여줄 뿐 화면 요소를 짚어주지
않으며, Sheet/Dialog는 한 번에 하나의 표면이지 화면 곳곳을 옮겨 다니지 않는다.
그래서 `docs/notification.md`·`docs/dropdown.md`·`docs/virtual-list.md`와 달리
이 문서는 "만들지 않는다"가 아니라 실제 계약을 연다.

## 일반화한 계약

### 앵커는 불투명한 식별자다 — DOM도 RN 노드도 모른다

`TourStepDescriptor.anchorId`는 제품이 이미 쓰고 있는 문자열 키일 뿐이다. 실제
요소를 찾아 측정하고, 화면 안으로 스크롤하고, 하이라이트/컷아웃을 그리는 일은
전부 렌더러의 몫이다. 이 모듈은 ref도 좌표도 받지 않는다 — Icon이 third-party
아이콘 컴포넌트 대신 semantic name만 받는 것과 같은 경계, Tooltip/Popover가 DOM
측정·portal·flip/shift를 비공개 `AnchoredOverlay`에 위임하는 것과 같은 경계다.

`anchorId`는 step끼리 겹칠 수 있다 — 검증기는 step `id`의 유일성만 강제하고
`anchorId` 중복은 허용한다. "여기를 탭하세요" 다음 "이제 꾹 눌러 순서를
바꾸세요"처럼 같은 요소를 두 단계에 걸쳐 설명하는 것은 유효한 사용이다. 이건
브리프가 요구한 "validator가 잘못 잡는 입력으로 먼저 시험하라"를 그대로 따른
결과다 — 처음에는 유일성을 강제할 뻔했지만, 그러면 이 legitimate한 두 번째
사용을 막게 된다.

### 단일 커서 — Steps와 같은 원리, 다른 이유로 다른 anatomy

`TourDescriptor.currentStepId` 하나가 진행 상태의 유일한 근거다. per-step 상태
배열을 받지 않는 이유는 Steps와 같다 — "두 단계가 동시에 current"인 상태를 애초에
표현 불가능하게 만든다.

**그러나 Tour는 `stepsRecipe`를 재사용하지 않는다.** `Steps`의 anatomy(마커 +
커넥터로 이어진 체인)는 모든 단계가 **한 화면에 동시에, 같은 트랙 위에** 보인다는
전제 위에 있다 — 그래서 인접 마커를 잇는 선(`connector`)이 의미를 가진다. Tour는
정반대다: 한 번에 한 단계만 보이고, 그 단계는 매번 화면의 **다른, 서로 인접하지
않은** 요소 옆에 뜬다. 두 앵커 사이에 커넥터를 그리면 아무것도 잇지 않는 선이
된다 — `docs/steps.md`가 "이 세 축을 억지로 채우면 유령 계약이 된다"고 말한 것과
같은 함정이다. 그래서 이 모듈은 Steps의 시각 recipe를 가져오지 않고, "단일
커서로 유도한다"는 **원리**만 독립적으로 다시 구현한다(`resolveTourAdvance`) —
브리프가 요구한 모듈 자급자족 원칙과도 맞는다(다른 저작 모듈들도 서로를 import하지
않는다).

대신 Tour의 카드는 Popover/Tooltip과 같은 문제를 공유한다 — "트리거(여기서는
앵커)에 붙어 뜨는 표면". 그래서 `tourRecipe.card`는 `floatingSurfaceContract`를
그대로 재사용한다.

### 포커스와 낭독 — "이 부분을 보세요"가 성립하지 않는 사용자에게

시각적 스포트라이트는 화면을 볼 수 있는 사용자에게만 의미가 있다. 스크린 리더
사용자에게 이 컴포넌트가 실제로 하는 일은 **카드에 적힌 문장**이지 앵커를
가리키는 화살표가 아니다. 그래서 계약은 두 가지를 명시한다.

1. 단계가 바뀔 때 포커스/접근성 포커스는 **앵커가 아니라 카드**로 이동한다.
   화면을 볼 수 없는 사용자도 "무엇을 설명하는 중인지"를 알 유일한 방법이
   카드이기 때문이다.
2. `composeAnnouncement`가 만든 문장이 그 카드의 접근 가능한 내용이다 — Steps의
   `composeAccessibleName`과 같은 이유로(한국어 "5단계 중 2단계"는 영어 어순과
   다르다) 제품이 조립하되, `resolveTourDescriptor`는 빈 문자열을 던진다.

배경은 inert 처리한다(Web `inert`/`aria-hidden`, Native
`importantForAccessibility="no-hide-descendants"`) — 그렇지 않으면 화면
낭독기가 아직 설명되지 않은 배경 요소로 사용자를 데려갈 수 있다.

### 탈출

Escape와 명시적 "건너뛰기" 액션은 어떤 단계에서도 항상 동작한다 — 이건
설정값이 아니라 고정 규칙이다(`tourBehaviorDefaults`는 축이 하나뿐이다:
`outsideDismiss: false`). Popover처럼 `dismissible`/`escapeDismiss`를 따로
끌 수 있게 하지 않는다 — 브리프의 "언제든 그만둘 수 있어야 한다"는 요구가
협상 불가능하기 때문이다. 반대로 바깥 영역 클릭으로 조용히 끝나는 것은 허용하지
않는다(`TourCloseReason`에 `"outside"`가 없다) — 다단계 설명 도중 실수로 화면
바깥을 건드려 안내 전체가 사라지는 사고를 막는다.

그만둔 상태를 기억할지(다시 안 보여주기)는 **제품 몫**이다. 이 모듈은
`TourCloseReason`으로 "왜 끝났는지"만 보고하고, 그 결과를 어디에 저장할지는
갖지 않는다.

### 세션이 아니라 순수 함수로 — AlertDialog보다 Popover에 가깝다

AlertDialog는 `idle→busy→error/closing→closed`라는 상태를 가진 세션
(`createAlertDialogSession`)을 갖는다 — 되돌릴 수 없는 비동기 side effect를
정확히 한 번 실행하고 정산해야 하기 때문이다. Tour에는 그런 비동기 side effect가
없다 — 버튼을 누르면 다음 카드로 넘어가거나 닫힐 뿐이다. 그래서 이 모듈은
Popover처럼 순수 판정 함수(`resolveTourAdvance`, `validateTourOpenState`)만
공개하고 상태 객체를 만들지 않는다. "정확히 한 번 정산"이 필요한 건 여기서는
평범한 콜백 호출 하나로 이미 충분하다 — 재시도할 실패한 side effect가 없기
때문이다.

## HJM 기본값

- `outsideDismiss: false` 고정.
- 카드는 `floatingSurfaceContract`, 배경은 `backdrop.modal`(`backdrop.veil`이
  아니다) — Tour는 Dialog/Sheet처럼 배경 상호작용을 막으므로(`outsideDismiss:
  false`), 배경이 계속 조작 가능한 곳에서 쓰는 옅은 `veil`이 아니라 실제로 막는
  곳에서 쓰는 `modal` 톤을 쓴다(Sheet/Dialog/SidePanel/CommandPalette와 동일
  선택).
- 단계 전환 모션은 `motionPreset.context`(320ms, Reduce Motion에서 opacity) —
  서로 인접하지 않은 화면 부위 사이를 옮겨 다니는 "맥락 전환"이지, 같은 자리에서
  일어나는 작은 상태 변화가 아니다.

## 플랫폼 번역

- Web: 카드는 포커스를 받을 수 있는 컨테이너(`tabIndex={-1}`)이고, 단계가 바뀔
  때마다 `.focus()`한다. 배경은 `inert`. Escape는 항상 닫는다.
- Native: 단계 변경 시 카드로 접근성 포커스를 이동한다(플랫폼 focus API). 배경은
  `importantForAccessibility="no-hide-descendants"`.
- Reduce Motion: 카드는 위치 이동 없는 opacity 교차로 나타나고, 앵커 사이를
  이동하는 스포트라이트 애니메이션은 두지 않는다(즉시 다음 위치로 전환).

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| 단일 커서(`currentStepId`) | 공개 |
| `next`/`previous`/`skip`/완료(`complete`) | 공개 |
| `TourCloseReason`(skip/escape/complete/programmatic/interrupted) | 공개 |
| 앵커 측정·하이라이트 지오메트리 | **배제** — 렌더러 소유(위 "앵커는 불투명한 식별자다" 참고) |
| `outside` dismiss | **배제** — 실수로 안내가 끊기는 사고를 막는다 |
| 단계별 개별 status 배열 | **배제** — Steps와 같은 이유로 유효하지 않은 조합(두 단계가 동시에 current)을 표현 불가능하게 한다 |
| Steps의 시각 recipe(마커/커넥터) 재사용 | **배제** — 위 "단일 커서" 절의 판정 참고. 카드 anatomy는 대신 Popover/Tooltip의 `floatingSurfaceContract`를 재사용한다 |
| "다시 보지 않기" 영속화 | **배제** — 제품이 `TourCloseReason`을 받아 직접 저장할 몫 |
| 비동기 busy/error 상태 | **배제** — Tour에는 되돌릴 수 없는 side effect가 없다. AlertDialog의 세션 패턴을 가져올 이유가 없다 |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가
진행한다. 유력 후보: Yajalal 홈 화면 첫 진입 안내(검색 → 즐겨찾기 → 알림).
