# HJM 오픈소스 흡수 후보와 통합 설계

조사일: 2026-09-30 · 상태: 제안, 구현/설치/게시 아님 · 범위: React Web + React Native

## 1. 추천 결정

**1차는 SortableCollection, SwipeActions, ContentTransition을 추천한다.** 정렬·빠른 행 작업·상태 전환은 제품에서 반복해서 쓰이고, 기존 HJM의 비어 있는 상호작용을 채운다. 사진 속 알림처럼 시각적 차이가 큰 후보는 CarouselMotion과 Celebration이다. Shared-element 화면 전환은 router 결합이 커서 제품 단위 실험으로 남긴다.

이번 요청의 계기는 Dynamic Island에서 물방울처럼 분리되는 앱 내부 알림이다. 예쁜 데모를 복사하는 수준을 넘어서 HJM의 토큰, 상태, 접근성, 해제/취소, 의존성 경계까지 유지하는 것이 흡수의 기준이다. 아래 API와 검증 조건은 제안이며 upstream이 이미 제공하는 보장으로 읽지 않는다.

## 2. 먼저 확인한 현재 HJM

로컬 checkout `feat/stable-components-and-data-layouts`, HEAD `f1d28a3`와 기존 미커밋 변경을 함께 읽었다. package manifest는 1.8.0이다. 이것만으로 npm 게시나 앱 적용을 주장하지 않는다. 기존 작업 파일은 수정하지 않았다.

| 이미 있는 기능 | 실제 위치 | 이번 판단 |
| --- | --- | --- |
| Liquid Toast | [설계](liquid-toast.md), `@hjmds/react-native/toast-liquid` | 사진의 [expo-dynamic-notifications](https://github.com/rit3zh/expo-dynamic-notifications)를 모티브로 이미 흡수. 신규 후보에서 제외 |
| ThinkingOrb | [계약](../../packages/design-contracts/docs/thinking-orb.md) | AI 상태용 표현이 이미 있으므로 새 orb/spinner 중복 도입 제외 |
| NumberFlow, Bloom | [기존 어댑터](../../packages/design-contracts/docs/optional-adapters.md), `statistic-motion`, `menu-morph` | 숫자/메뉴 모핑 중복 제외 |
| Zoom Toolkit, Keyboard Controller, Gorhom Sheet, Zeego | 같은 문서의 Native 4개 entry | 이미지 확대·키보드·시트·OS 메뉴 재도입 제외 |
| Carousel | [Native 구현](../../packages/react-native/src/carousel.tsx), [공통 계약](../../packages/design-contracts/src/carousel.ts) | swipe 종료 후 slide를 바꾸는 구현이 있음. 드래그 중 연속 움직임을 추가할 여지가 있음 |
| motion 토큰 | [foundations](../../packages/design-contracts/src/foundations.ts) | 120/200/320ms 및 reduced-motion 계약 재사용. 별도 모션 테마 신설 불필요 |

기존 어댑터의 9월 30일 문서는 후속 Web/iOS/Android 검증 기록을 연결한다. [iOS 기록](../evidence/full-audit-2026-09-29/IOS-AUDIT.md)에는 시뮬레이터 화면/행동 근거가 있으나 물리 기기·VoiceOver·모든 글자 크기·애니메이션 성능을 보장하지 않는다. 과거의 “기기 증거 없음” 메모를 현재 상태로 반복하지 않는다. 이번에는 그 기록을 읽었으며 UI 검증을 재실행하지 않았다.

## 3. 후보 비교

우선순위는 제품 효용, 현재 HJM과 중복, host 변경 비용을 바탕으로 한 설계 판단이다. 아래 제품 예시는 적용 가능성이지 현재 해당 기능이 출시되어 있다는 주장이 아니다.

| 우선순위 / HJM 제안명 | 원본·데모 | 흡수할 경험 | Web / Native 전략 | 주요 비용 |
| --- | --- | --- | --- | --- |
| P1 `SortableCollection` | [RN Sortables](https://github.com/MatiPl01/react-native-sortables), [dnd-kit](https://github.com/clauderic/dnd-kit) | 사진·태그·즐겨찾기를 잡아 순서 변경, 주변 항목이 자리를 비켜줌 | Web dnd-kit, Native Sortables를 각각 adapter로 사용 | Native 탭 복귀 후 gesture 상태, 접근성 대체 조작, 서버 저장 실패 처리 |
| P1 `SwipeActions` | [Reanimated Swipeable](https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable/) | 목록을 밀어 보관·읽음·삭제 버튼 노출 | Native 기존 Gesture Handler 재사용, Web 명시적 버튼/Menu | 세로 scroll·뒤로가기 gesture 충돌, 행 재활용, 중복 실행 |
| P1 `ContentTransition` + 선택적 `TextTransition` | [Motion Primitives](https://github.com/ibelick/motion-primitives) | 탭/단계/상태 내용이 연결되어 바뀌고 짧은 상태 문구가 변형됨 | Web 일부 소스 흡수, Native 동등한 의미를 기존 RN Animated로 구현 | focus·DOM 중복·SSR, 긴 한글/이모지, upstream beta |
| P2 `CarouselMotion` | [RN Reanimated Carousel](https://github.com/dohooo/react-native-reanimated-carousel), [Embla](https://github.com/davidjerleke/embla-carousel) | 손가락에 붙어 움직이는 카드와 자연스러운 snap | 양쪽 optional engine, 기존 Carousel selection/labels 유지 | 기존 기본 Carousel과 이중 관리, 중첩 gesture, 큰 이미지 메모리 |
| P2 `Celebration` | [Fast Confetti](https://github.com/AlirezaHadjar/react-native-fast-confetti), [Canvas Confetti](https://github.com/catdad/canvas-confetti) | 첫 기록·목표 달성 시 짧은 입자 효과 | Native Skia adapter, Web canvas adapter | GPU/배터리, 반복 재생, reduced motion. 일상 저장마다 사용하지 않음 |
| P3 제품 전용 `SharedTransition` 실험 | [Screen Transitions](https://github.com/eds2002/react-native-screen-transitions) | 썸네일이 상세 화면으로 이어지는 전환 | Native router adapter만 먼저 실험, Web 일반 route 유지 | navigation·teleport 의존성, back/cancel 복원. DS 기본 기능 편입 보류 |

### 공개 상태·라이선스·호환성

GitHub README/라이선스 파일과 npm registry를 직접 조회했다. `latest`는 조사 시점 게시 상태이며 **HJM에서 검증한 버전이 아니다**. 저장소 root의 package version과 실제 npm 패키지를 구분했다. 예를 들어 Sortables root는 1.0.0이지만 게시 패키지는 1.10.1이다.

| 원본 | 조사 시점 npm latest / 라이선스 | 확인한 제약·유지보수 신호 |
| --- | --- | --- |
| react-native-sortables | 1.10.1 / MIT | main 9/26 변경. Reanimated 3+/Gesture Handler 2+ peer. README는 iOS New Architecture에서 GH2로 화면을 다시 붙일 때 drag가 멈추는 문제와 GH3 해결을 명시. HJM의 GH2.32에서 재현 여부 확인 전 채택 확정 불가 |
| @dnd-kit/react | 0.5.0 / MIT | main 9/12 변경. React/DOM 18 또는 19. 현재 구조는 abstract → DOM → React이며 예전 core/sortable 튜토리얼과 혼용 금지. 이전 계열 core 6.3.1 + sortable 10.0.0은 대조용으로만 기록 |
| Motion Primitives | 소스 선택 흡수 / MIT | main 9/28 변경, README 자체 beta 표시. 전체 Next/Tailwind 사이트 의존성을 가져오지 않음 |
| Gesture Handler | 기존 HJM 2.32.0 재사용 / MIT | 프로젝트 main 9/29 변경. 최신 온라인 문서 예제를 기존 설치 버전에 그대로 복사하지 않고 해당 버전의 ReanimatedSwipeable export/타입을 확인할 것 |
| react-native-reanimated-carousel | 5.1.1 / MIT | main 8/8 변경. RN≥0.80, Reanimated≥4.1, Worklets≥0.5, GH≥2.9 및 <4. README의 v5 지원표와 실제 host를 대조 |
| embla-carousel-react | 8.6.0 / MIT | 저장소는 9.0.0-rc03 개발 중, npm latest는 8.6.0. 1차 실험은 latest 고정; RC 코드를 stable API처럼 사용하지 않음 |
| react-native-fast-confetti | 2.0.2 / MIT | main 8/26 변경. Skia≥2 <3, Reanimated≥4.1 <5, Worklets≥0.7 <1. 현재 optional host peer 범위와 겹치지만 RN 0.86 실측 보장 아님 |
| canvas-confetti | 1.9.4 / ISC | main 최근 commit 2025-10-25, archived 아님. 변경이 드물다는 사실만으로 불량 판정하지 않음. reduced-motion 비활성화 옵션은 기본 false라 HJM이 명시 설정해야 함 |
| react-native-screen-transitions | 4.0.0 / MIT | README는 v3 current라고 쓰지만 registry latest는 v4. React≥19.2, navigation≥7.3, teleport≥1.2, Worklets≥0.8 peer가 있어 문서·게시물 일치부터 확인 필요 |

이 표는 직접 패키지의 라이선스·공개 메타데이터 검토다. 전이 의존성 전체 감사, 보안 권고 감사, 각 후보의 이슈 전수 검토, 실제 성능 검증은 수행하지 않았다. 신규 의존성은 아직 등록하거나 설치하지 않았다.

## 4. 통합 구조

기존 세 패키지 구조를 유지한다. 아래 경로는 새로 제안하는 경로이며 아직 존재하지 않는다.

```text
@hjmds/design-contracts
  sortable-collection / swipe-actions / content-transition / celebration
  └─ 상태, intent, 안정적인 ID, i18n label, 취소, reduced-motion 계약

@hjmds/react
  sortable / content-transition / carousel-motion / celebration
  └─ DOM·focus·ARIA / 선택적 dnd-kit·Motion·Embla·canvas

@hjmds/react-native
  sortable / swipe-actions / content-transition / carousel-motion / celebration
  └─ accessibilityActions·AppState·gesture / 선택적 Sortables·Skia 등

제품
  └─ 데이터, 권한, 저장/실패/되돌리기, router, 번역, 성공 여부
```

선택 기준은 다음과 같다.

- **엔진은 wrapper로 사용:** drag 충돌, gesture, snap, particle은 upstream 업데이트를 받을 가치가 크다. upstream prop 전체를 HJM public API로 재노출하지 않는다.
- **작은 패턴은 소스 흡수:** Motion Primitives의 일부 패턴만 commit을 고정해 가져오고 notice를 배포한다. Tailwind class·색상·임의 easing은 HJM recipe로 바꾼다.
- **플랫폼 인프라는 host에 둠:** router/provider/native linking은 앱이 소유한다. navigation을 디자인 시스템 기본 peer로 추가하지 않는다.
- **기본 진입점에 optional peer를 섞지 않음:** 기존 optional-adapter 정책처럼 subpath로 분리한다. optional peer가 없을 때 import 자체가 실패할 수 있으므로 “자동 fallback”을 약속하지 않는다. host가 optional entry 또는 기본 entry를 선택한다. reduced motion 등 실행 중 환경 변화의 fallback은 해당 entry가 담당한다.
- **프레임워크 중복 방지:** HJM에는 Bloom용 framer-motion이 이미 있다. Motion Primitives의 `motion/react` import를 그대로 추가해 같은 엔진의 두 패키지를 설치하는 안보다 기존 런타임 API에 맞추는 안을 먼저 검증한다.

## 5. 기능별 설계

### 5.1 SortableCollection — 우선 1

첫 범위는 **한 컨테이너의 짧은 목록/그리드 재정렬**이다. Native upstream의 가상화 미지원 논의가 있으므로 무한 피드·여러 보드 간 이동은 제외한다. [maintainer 논의](https://github.com/MatiPl01/react-native-sortables/discussions/448)를 근거로, 최초 showcase는 10개와 30개 항목을 검증 크기로 사용한다. 이 숫자는 성능 보장이나 public maxItems가 아니다.

제안 계약:

```ts
type ReorderIntent = {
  itemId: string;
  fromIndex: number;
  toIndex: number;
  orderedIds: readonly string[];
  source: "drag" | "keyboard" | "accessibility-action";
};
// 제품이 order를 소유한다. onCommit은 저장 성공을 의미하지 않는다.
type SortableContract = {
  order: readonly string[];
  disabledIds?: readonly string[];
  onCommit(intent: ReorderIntent): void;
  onCancel?(): void;
};
```

`idle → dragging → commit intent 또는 cancel → idle`. drag 동안의 임시 위치는 renderer 안에 둔다. 중복 ID는 거부하고, drag 중 원본 목록이 바뀌면 취소해 새 order를 적용한다. 제품은 저장 실패 시 이전 order와 재시도 UI를 제공한다. 화면 이탈/배경 전환/항목 삭제 시 overlay와 gesture를 해제한다.

손잡이로만 drag를 시작하고 행 탭과 구분한다. Web 키보드 정렬, Native “앞으로/뒤로 이동” accessibility action, 일반 이동 버튼을 같은 commit 경로에 연결한다. 번역된 위치 안내도 계약에 포함한다. reduced motion에서도 순서 변경은 가능하며 이동 애니메이션만 제거한다.

**첫 검증 과제:** HJM GH2.32 host에서 tab detach/reattach 후 재정렬. 실패하면 전 앱 GH3 상향을 끼워 넣지 않고 해당 후보를 보류하거나 대체 엔진을 비교한다. 버전 범위가 넓다고 호환성이 증명된 것은 아니다.

### 5.2 SwipeActions — 우선 2

`id`, `label`, `intent`, `disabled`를 가진 작업 목록을 받고 `onAction(id)`만 전달한다. row ID 단위로 열림 상태를 제어하고 한 그룹에서 한 행만 열도록 한다. 기본값은 **밀어서 버튼 노출**, 전체 swipe 즉시 삭제는 제공하지 않는다. 이는 scroll 오동작이 데이터 삭제로 이어지는 것을 피하기 위한 선택이다.

`closed → dragging → revealed → action/pending → closed`. 실행 중에는 같은 action 재입력을 막고 실패 시 제품 상태를 표시한다. 취소/재시도와 서버 mutation은 제품 책임이다. 재활용된 행이 이전 행의 열린 상태를 물려받지 않게 ID 변경 시 reset한다.

Native의 start/end는 RTL에 따라 물리적 좌우로 변환한다. 세로 스크롤 및 OS 뒤로가기 gesture와 경쟁을 검증한다. Web과 screen reader에는 항상 동일 행동의 버튼/Menu 경로를 제공한다. 삭제 확인과 Undo는 기존 AlertDialog/Toast에 연결할 수 있게 하고 내부에 별도 확인 시스템을 만들지 않는다.

### 5.3 ContentTransition / TextTransition — 우선 3

흡수 원본은 [TransitionPanel 소스](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/transition-panel.tsx), [TextMorph 소스](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-morph.tsx)다. AnimatedGroup·장식 배경·dock 전체를 한꺼번에 가져오지 않는다.

제안 API는 `stateKey`, `preset: "fade" | "slide"`, `children`, `motion: "system" | "none"` 정도로 제한한다. 첫 구현은 두 renderer 모두 fade를 제공한다. Web은 기존 Motion 런타임, Native는 RN Animated를 사용해 작은 효과 때문에 Skia peer가 추가되지 않게 한다.

로딩→빈 상태→결과는 기존 ContentState의 의미를 유지하고 표시 교체만 담당한다. 옛 패널은 즉시 입력과 접근성 탐색에서 제외한다. 기존 focus가 퇴장 패널 안에 있을 때만 제품이 지정한 새 focus target으로 옮긴다. 입력 폼은 stateKey 변경에 따른 remount로 초안이 지워지지 않도록 상태를 밖에서 소유한다. 빠른 연속 변경은 마지막 상태로 수렴하며 SSR 첫 렌더는 애니메이션 없이 동일하게 출력한다.

TextMorph 원본은 `split('')`로 문자를 나눈다. **그대로 복사하면 이모지/결합문자 단위를 깨뜨릴 수 있어** `Intl.Segmenter` 지원 시 grapheme 단위로 나누고, 미지원·긴 문구·RTL·큰 글자 환경에서는 문장 전체 fade/정적 텍스트로 내린다. 시각 문자 레이어는 접근성 트리에서 숨기고 완성된 문장 하나를 제공한다. 문구가 바뀔 때마다 live announcement를 자동 발행하지 않는다. RN의 문자별 layout morph는 1차 범위에서 제외하며 문장 fade로 의미를 맞춘다.

### 5.4 CarouselMotion — 우선 4, 기존 기능 확장

기존 `currentKey`, `onCurrentKeyChange`, `slides`, 접근성 label 및 previous/next 버튼을 유지한다. engine은 offset·velocity·snap만 담당하고 slide 선택의 기준은 ID다. 1차 preset은 `slide`; stack/parallax는 읽기 영역과 성능을 확인한 뒤 추가한다.

기존 HJM처럼 기본 autoplay 없음, 끝에서 멈춤, 명시적 loop 미지원 유지. upstream 기본값에 의존하지 않고 adapter가 이 동작을 지정한다. 드래그 완료·버튼·외부 선택 변경을 동일한 선택 경로로 모으고, reduced motion은 즉시 위치 이동, background/screen reader는 autoplay 정지를 보장한다.

Web Embla 8.6.0과 Native Carousel 5.1.1을 후보 고정 버전으로 실험한다. v5의 API를 v4 예제와 섞지 않는다. 전체 무한피드나 앱 라우팅을 Carousel에 넣지 않는다.

### 5.5 Celebration — 우선 5

제안 API는 `eventId`, `preset: "small-burst" | "milestone"`, `onComplete`다. 성공 텍스트/아이콘은 기존 Result/Toast가 담당하고 particle은 장식이다. 제품이 실제 성공 후 호출하며 효과가 API 성공을 추정하지 않는다.

같은 mount/session의 eventId 중복 재생을 막고 영구 중복 방지는 제품이 맡는다. background/unmount 시 정지, overlay는 pointer event를 차단하지 않는다. reduced motion이면 입자를 생략하고 성공 UI를 유지하며 completion을 한 번만 전달한다. Native particle 수·실행 시간은 저사양 기기 프로파일링 후 recipe로 정한다.

Web은 전용 canvas instance를 만들고 unmount 시 그 instance만 reset한다. 전역 reset으로 다른 화면의 효과를 끊지 않는다. `disableForReducedMotion: true`를 명시한다. Native는 이미 Skia를 쓰는 host부터 실험한다. 작은 축하 효과 하나만을 위해 모든 소비 앱에 Skia를 강제하지 않는다.

### 5.6 SharedTransition — 제품 실험으로 보류

사진 상세/카드 상세 연결은 매력적이지만 routing, back gesture, deep link, screen unmount까지 영향을 준다. 현재 게시 peer와 README의 v3/v4 불일치도 남아 있다. HJM core peer로 넣지 않고 제품 router adapter에서 먼저 검증한다. HJM이 공유할 것은 transition intent와 reduced-motion 정책 정도다. 취소 시 원래 위치·focus·scroll을 복원하지 못하면 일반 route transition으로 돌아간다.

## 6. 제외하거나 참고만 할 후보

- **Animate UI:** [현재 LICENSE](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md)는 MIT + Commons Clause로 원형 컴포넌트 자체의 판매/재배포 제한을 둔다. 공개 HJM 패키지 소스 흡수 후보에서는 제외한다. UI 사용 허용과 DS 재배포 권한을 같은 것으로 보지 않는다.
- **추가 Toast / Bottom Sheet / 숫자 모핑 패키지:** Sonner류 또는 다른 sheet를 동시에 넣기보다 현재 queue·overlay·접근성 계약과 기존 optional adapter를 개선한다. 중복 상태 관리의 비용이 신규 효용보다 크다.
- **장식 UI 모음 전체 import:** landing page용 spotlight, beam, 배경 효과를 DS 기본 엔진에 포함하지 않는다. 기능마다 실제 소비 시나리오를 확인한 뒤 개별 소스/라이선스를 검토한다.
- **새 가상 목록 엔진:** 이미 VirtualList가 있으며 렌더링 엔진 교체는 대표 앱의 데이터 크기·메모리 병목 측정 후 별도 판단한다. 이번 요청의 시각·상호작용 개선과 묶지 않는다.

## 7. 구현 순서와 승격 조건

1. **호환성 spike:** Sortables GH2 복귀 문제, 새 dnd-kit 0.5 API, Motion 런타임 재사용부터 작은 showcase로 확인한다. 실패한 후보는 계약 구현에 들어가기 전에 내린다.
2. **공통 계약:** Sortable/SwipeActions/ContentTransition의 ID·취소·i18n·접근성 intent를 먼저 정의한다. Web/Native의 의미는 공유하고 platform 표현은 나눈다.
3. **optional adapter와 showcase:** 대표 정상·빈 데이터·긴 문구·오류·disabled·reduced motion 사례를 연결한다. 새 canonical 항목이 필요한 기능만 catalog에 추가한다. 표현만 확장한 Carousel은 별도 canonical 수를 늘리지 않는다.
4. **대표 제품 적용:** 정렬은 사진/즐겨찾기 편집 화면, SwipeActions는 사용자 소유 목록, ContentTransition은 상태가 바뀌는 패널 한 곳으로 제한해 시작한다. 실제 소비 화면은 구현 착수 시 제품 source에서 확정한다. 웹·앱 동시 운영 제품은 양쪽 기능 경로를 함께 적용한다.
5. **게시 전 검증:** 중앙 library-policy 등록·소비 문서·exact version·notice·pack 및 base-entry 번들 격리를 확인한다. 기존 release train을 따르고 새 package train은 만들지 않는다.

| 검증층 | 통과에 필요한 관찰 |
| --- | --- |
| 계약 | 중복 ID, drag 중 원본 변경, 취소, 연속 업데이트, action 한 번 실행, reduced-motion state 수렴 |
| Web | 키보드·focus 복원·SSR hydration·RTL·200% 글자 크기·포인터 드래그·배경 전환 |
| Native | 기존 Device Hub 기기 재사용, 세로/가로 gesture 경쟁, 탭 복귀, Android back, background, 큰 글자, VoiceOver/TalkBack |
| 성능 | 기본/optional import graph 비교, drag/particle 중 UI·JS frame time와 메모리 실측. “60fps” 홍보 문구를 측정 결과로 쓰지 않음 |
| 릴리스 | 타입·build·회귀·showcase·notice/pack, 후보 버전으로 소비 앱 smoke, 그 뒤 게시·적용을 별도 기록 |

실기기·스크린리더와 성능 확인 전 신규 기능은 experimental/beta다. 이번 산출물은 조사·설계이며 이 표의 실행 완료를 의미하지 않는다.

## 8. 조사 재현용 원본

GitHub repository API, README, license와 package manifest를 읽고 npm `dist-tags.latest` 및 해당 버전의 peerDependencies를 별도로 대조했다. 아래 SHA는 확인한 default branch snapshot으로, npm tarball의 build commit과 같다고 주장하지 않는다. 전부 조사 시점 archived=false였다.

| 저장소 | 확인한 commit |
| --- | --- |
| RN Sortables | [0e8280a](https://github.com/MatiPl01/react-native-sortables/tree/0e8280a7256fde9bb47ea34e753f7a182c7f8cde) |
| dnd-kit | [e522d9c](https://github.com/clauderic/dnd-kit/tree/e522d9c6a3cbe39e6e980ee3b6fd7a78f238ab94) |
| Motion Primitives | [120f64f](https://github.com/ibelick/motion-primitives/tree/120f64f6ca60348e251f929e9c81f11ccbe45eda) |
| Gesture Handler | [71df747](https://github.com/software-mansion/react-native-gesture-handler/tree/71df747c4b8ed9547337cc902b692b78c83dd195) |
| RN Carousel | [e437fa8](https://github.com/dohooo/react-native-reanimated-carousel/tree/e437fa8d2a7db1c1ce96057691b19532a8e4472c) |
| Embla | [85a5e3c](https://github.com/davidjerleke/embla-carousel/tree/85a5e3cdb69756d6e139e697665cee72e1150e05) |
| Fast Confetti | [83f9802](https://github.com/AlirezaHadjar/react-native-fast-confetti/tree/83f980234b8561ebcbf7043a789894f39dc45fe5) |
| Canvas Confetti | [20eebad](https://github.com/catdad/canvas-confetti/tree/20eebad51dde793070c373d594099a7ed8d96e22) |
| Screen Transitions | [80e7a54](https://github.com/eds2002/react-native-screen-transitions/tree/80e7a54d630cb90754d0eea14abe181c23a88d38) |

npm 원본: [Sortables 1.10.1](https://registry.npmjs.org/react-native-sortables/1.10.1), [dnd-kit React 0.5.0](https://registry.npmjs.org/@dnd-kit%2freact/0.5.0), [Carousel 5.1.1](https://registry.npmjs.org/react-native-reanimated-carousel/5.1.1), [Embla 8.6.0](https://registry.npmjs.org/embla-carousel-react/8.6.0), [Fast Confetti 2.0.2](https://registry.npmjs.org/react-native-fast-confetti/2.0.2), [Canvas Confetti 1.9.4](https://registry.npmjs.org/canvas-confetti/1.9.4), [Screen Transitions 4.0.0](https://registry.npmjs.org/react-native-screen-transitions/4.0.0).

HJM 구현 시 적용할 정책: 이 저장소 [라이브러리 정책](../LIBRARY_POLICY.md), [optional adapter 계약](../../packages/design-contracts/docs/optional-adapters.md), 포트폴리오 공통 [라이브러리 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/LIBRARY_POLICY.md)과 [공용 모듈 표준](https://github.com/jim1286/app-portfolio/blob/main/docs/MODULE_DEVELOPMENT_STANDARD.md).
