# Carousel contract

이 컴포넌트는 접근성에서 가장 자주 실패하는 패턴이다. 아래 계약은 브리프가 요구한 세
가지 안전장치(자동 재생 opt-in, 현재 위치의 낭독 가능한 이름, 순환 없음)를 타입과
검증기로 강제해, 렌더러가 그중 하나를 빼먹은 채로 컴파일되지 않게 한다.

## 문제

사용자가 한 번에 하나만 보이는 카드 묶음을 순서대로 넘겨 본다 — 야잘알 홈의 "내 구단
경기 스트립"(가로 스크롤 페이저)이 실사용처다. Ant Design `Carousel`과 같은 사용자
문제를 풀지만, HJM은 `direct` crosswalk를 따르면서도 antd의 기본 동작 두 가지(무한
순환, 자동 재생 기본값)를 의도적으로 걷어낸다.

## 일반화한 계약

### collection 기본 계약과의 대응

각 슬라이드는 stable string `id`와 보이는 `label`(슬라이드의 접근 가능한 이름, 예: "8/19
두산 vs LG")만 가진다. 슬라이드의 실제 시각 콘텐츠는 제품이 소유한다 — Statistic이
숫자를 포맷하지 않는 것과 같은 경계로, Carousel도 카드 내부를 렌더링하지 않는다.
`textValue`, selection mode, 비동기 `idle|loading|empty` 상태는 Steps·Timeline과 같은
이유로 가져오지 않는다 — 슬라이드 집합은 검색 대상이 아니고, 로딩/empty는 제품이
Carousel을 마운트할지 말지로 먼저 판단한다(빈 배열은 `validateCarouselDescriptor`가
던진다).

### 현재 위치는 stable key로, 순서는 그 위에서 유도한다

브리프는 "value의 현재 인덱스"라 표현하지만, 이 저장소의 다른 모든 controlled selection은
raw 인덱스가 아니라 stable string key를 값으로 쓴다(`SelectSelection`, `TabsSelection`,
`RadioGroupSelection` — [[collection]], `src/behaviors.ts`). 슬라이드 배열이 필터링되거나
재정렬돼도 "지금 보고 있던 그 카드"가 사라지지 않게 하려면 인덱스보다 key가 안전하다.
그래서 `ControlledCarouselSelection`/`UncontrolledCarouselSelection`은 다른 컴포넌트와
같은 `currentKey`/`defaultCurrentKey`/`onCurrentKeyChange` 모양을 쓰고, 순수 계산
함수들(`resolveCarouselDescriptor`, `getCarouselNavigationTarget`)은 항상 이미 해석된
`CarouselDescriptor.currentKey: Id`(controlled/uncontrolled 분기가 끝난 값)를 받는다 —
`SelectState`가 렌더러 prop 모양이고 `reconcileSelectSelection`은 이미 해석된
`selectedKey`를 받는 것과 같은 분리다. "몇 개 중 몇 번째"라는 **인덱스 기반 정보**는
버리지 않는다 — `resolveCarouselDescriptor`가 매 슬라이드에 1-based `position`/`total`을
유도해서 붙인다. 즉 정체성은 key로, 위치 발화는 인덱스로 — 둘 다 필요하고 서로 다른
축이다.

### 현재 위치의 발화 가능한 이름 (필수)

각 resolved 슬라이드는 `position`, `total`, 그리고 제품이 공급한
`composeAccessibleName({ position, total, label })`으로 만든 `accessibleName`을 가진다 —
Steps·Timeline과 같은 이유(한국어/영어 어순 차이, RN에 순서 semantics가 없음)로 같은
해법을 재사용한다. 이 이름 **하나**가 세 곳에 재사용된다: 각 슬라이드 group의 접근
가능한 이름, 각 indicator dot 버튼의 label, 사용자가 직접 넘겼을 때의 발화 문구. 점
표시만으로 위치를 말하지 않는다는 브리프 요구를 이 세 재사용처가 함께 충족한다.

### 탭 순서: 사라지지도, 숨어서 받지도 않는다

두 실패 모드를 구분해야 한다 — (a) 슬라이드가 탭 순서에서 통째로 사라져 키보드
사용자가 다음/이전 컨트롤 없이는 절대 도달할 수 없는 경우, (b) 화면에 보이지 않는
슬라이드의 내부 링크가 여전히 tab 순서에 남아 포커스를 받는 경우(사용자가 보이지 않는
곳으로 포커스가 튀는 것을 경험한다 — 이게 더 나쁘다). 계약은 각 resolved 슬라이드에
`inert: boolean`(현재 슬라이드가 아니면 항상 true)을 붙여 렌더러가 (b)를 만들 수
없게 한다. (a)는 별도로 막는다 — `previousControl`/`nextControl`/dot indicator는
`inert`의 영향을 받지 않는 별도 슬롯이라 항상 tab 순서에 남고, 사용자는 이 컨트롤을
통해 결국 모든 슬라이드에 도달할 수 있다. 이 판단은 Tabs의 `mount policy`가 비활성
panel을 `hidden`/`inert` 처리하는 것과 같은 결까다(`docs/architecture.md`의 keyed Tabs
mount policy 참고) — 새로 만든 개념이 아니라 이미 검증된 패턴을 재사용한다.

### 순환 없음, 자동 재생은 opt-in

- `getCarouselNavigationTarget`은 첫/마지막 슬라이드에서 클램프한다 — `loop` 파라미터
  자체가 없다(`getCollectionNavigationTarget`의 `loop` 인자와 달리, Carousel에는 그
  스위치가 아예 존재하지 않는다). 무한 순환은 "끝"이 어디인지 말할 수 없게 만들고,
  스크린 리더 사용자가 이미 본 슬라이드로 되돌아왔는지 구분할 방법이 없어진다.
- `CarouselDescriptor.autoplay?`는 기본적으로 없다(`carouselBehaviorDefaults.autoplay ===
  false`). 넣더라도 `isCarouselAutoplayActive`가 세 가지 조건을 모두 통과해야만 재생을
  허용한다 — reduce motion이 꺼져 있고, hover/focus/drag로 인한 `paused`가 아닐 때뿐.
  세 조건을 한 함수에 모아 렌더러가 그중 하나를 빼먹고 타이머를 돌릴 수 없게 한다.
  자동 전환은 announce하지 않는다 — 사용자가 관여하지 않은 전환으로 스크린 리더
  발화를 방해하지 않는다. 사용자가 직접 넘겼을 때만 새 `accessibleName`을 발표한다.

## HJM 기본값

- indicator dot 지름 8px, hit target은 `control.minTouchTarget`(44)로 시각 크기와 별개다
  (Slider의 thumb-vs-hit-target 분리와 같은 이유). 비활성 dot은
  `semanticColors.border.strong`, 현재 dot은 `semanticColors.content.brand` — Steps의
  `current` 마커와 같은 이유로 `primary` fill이 아니라 `contentBrand`를 쓴다(위치 표시는
  행동이 아니다, `identity.md`).
- previous/next 컨트롤은 새 버튼 시각을 만들지 않고 기존 `iconButtonRecipe`(ghost tone)를
  그대로 합성한다 — `chevronStart`/`chevronEnd`(논리 방향, RTL에서 자동 mirror)만
  지정한다.
- 슬라이드 전환은 새 모션 토큰을 만들지 않고 기존 `motionPreset.context`(큰 화면 요소
  전환, reduce motion에서 opacity로 대체)를 그대로 쓴다. 자동 재생은 reduce motion에서
  아예 실행되지 않으므로 "느려진 자동 재생" 같은 중간 상태가 없다.
- `dragged`는 `interaction` 축의 값이고 `states.draggedOpacity`(기존 `opacity.dragged`,
  Slider와 동일)로 드러난다.

## 플랫폼 번역

- Web: root는 `region`, 각 슬라이드는 `group`(APG carousel 패턴의 `aria-roledescription`
  관례를 따른다 — 값 자체는 현지화 카피이므로 렌더러가 채운다). `focus: "roving"` —
  Tab은 previous → dots → next → **현재 슬라이드 내부의 인터랙티브 콘텐츠** 순으로만
  이동하고, `inert` 슬라이드의 내부 콘텐츠는 완전히 건너뛴다. `ArrowLeft`/`ArrowRight`는
  캐러셀 영역이나 컨트롤에 포커스가 있을 때 이전/다음으로 이동한다(브리프의 "좌우
  화살표와 탭 순서" 요구).
- Native: root는 `accessibilityRole="adjustable"`이고
  `accessibilityValue={{min:1, max:total, now:position, text:accessibleName}}`,
  `increment`/`decrement` action이 다음/이전에 대응한다 — 이건 Slider와 같은 선택이고,
  우연이 아니다. VoiceOver의 좌우 스와이프는 화면의 다음/이전 접근성 엘리먼트로
  이동하는 제스처로 이미 예약되어 있어서, 캐러셀 자체를 좌우로 "스와이프해 넘기는" 것과
  충돌한다. `adjustable` role의 위/아래 스와이프(rotor 조정 제스처)를 쓰면 이 충돌이
  없다. 화면을 직접 손가락으로 미는 시각적 스와이프(비-VoiceOver 사용자)는 렌더러의
  pan gesture가 처리하고, 같은 `getCarouselNavigationTarget`으로 판정한다. `inert`
  슬라이드는 `accessibilityElementsHidden`/`importantForAccessibility="no-hide-
  descendants"`.
- Reduce Motion: 수동 전환은 `motionPreset.context`의 `reducedMotion: "opacity"`를 따라
  크로스페이드로 대체된다. 자동 재생은 켜지지 않는다(위 자동 재생 절 참고).

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `value`(현재 슬라이드, stable key) + 유도된 `position`/`total` | 공개 — 위 "stable key vs 인덱스" 판단 참고 |
| `interaction`의 `dragged` | 공개 |
| previous/next/dot 컨트롤 tab 순서, 비활성 슬라이드 `inert` | 공개(필수 계약) |
| autoplay(opt-in) + reduce-motion/hover/focus/drag guard | 공개 — 기본 꺼짐 |
| 무한 순환(loop) | **배제** — "끝"을 말할 수 없게 되고 발화가 무너진다(브리프 지침) |
| `textValue`, selection mode, 비동기 `idle/loading/empty` | **배제** — Steps·Timeline과 같은 이유 |
| 슬라이드별 `disabled` | **배제** — 측정된 요구가 없다. 카드를 보여줄지 여부는 제품이 슬라이드 배열에 넣을지로 결정한다 |
| 한 화면에 여러 슬라이드를 보여주는 `slidesToShow` 류 설정 | **배제** — 실사용처(경기 스트립)는 한 번에 하나만 보여주는 페이저다. 필요해지면 그때 이 계약을 넓힌다 |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다(로드맵
maturity gate). 유력 후보: 야잘알 홈의 내 구단 경기 스트립.
