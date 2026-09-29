# Liquid Toast — 원본 모션을 흡수하는 HJM 설계

상태: v1 로컬 구현 · 미게시 · 기기 미검증 · 작성일: 2026-09-28 · 담당: HJM maintainer

사용자가 `expo-dynamic-notifications`를 HJM에 흡수하고 원본을 최대한 모티브로 삼도록
요청했다. 이 문서는 구현 방향과 검증 조건을 정한다. v1 코드가 추가되었으며 실제 사용법은
[Native 사용 문서](../../packages/react-native/docs/liquid-toast.md)에 있다. 게시·기기 검증 완료를 뜻하지 않는다.
기존 Toast의 선택형 표현이며 새 알림 시스템이나 OS Live Activity가 아니다.

## 1. 문제와 설계 결정

생성·업로드처럼 기다린 작업의 완료를 사용자가 알아채고 결과로 이동하게 한다.
원본의 특징인 **캡슐 → 늘어지는 목 → 물방울 분리 → 넓어지는 카드 → 내용 선명화 → 역방향 회수**를
유지한다. Android·아일랜드 없는 iPhone에서도 같은 액체 모션을 제공한다.

| 결정 | 이유와 채택하지 않은 대안 |
| --- | --- |
| 기존 Toast의 opt-in presentation | 별도 store를 두면 queue·닫기·접근성이 갈라진다. `DynamicNotifications`를 통째로 복제하지 않는다 |
| 일반 알림은 기존 표현, 제품이 고른 완료 순간만 liquid | HJM의 조용한 화면 원칙을 유지한다. 모든 저장·검증 오류를 흔드는 대안은 버린다 |
| 원본의 모션·실루엣을 우선하고 색·타이포·행동은 HJM | 2026-09-28 사용자 요청에 따른 시각 참조 범위다. 외부 팔레트·앱 mock 화면까지 이식하지 않는다 |
| 지원 기기에만 아일랜드 정렬, 나머지는 앱 안의 캡슐 | safe-area 값만으로 하드웨어를 추측하면 노치·통화 상태에서 겹친다. 모르는 기기는 capsule이 기본이다 |
| Skia/Reanimated 전용 subpath | 모든 HJM 소비자에게 새 native dependency를 강제하지 않는다. renderer 기본 entry에서 static import하지 않는다 |
| 기존 Toast catalog 안에서 설계 | 새 컴포넌트 이름을 등록하는 대안은 현재 catalog 동결과 불필요하게 충돌한다. Toast 자체의 beta 성숙도도 유지한다 |

정본: [Toast 계약](../../packages/design-contracts/docs/toast.md),
[identity](../../packages/design-contracts/docs/identity.md),
[architecture](../../packages/design-contracts/docs/architecture.md),
[브랜드 경계](../../packages/design-contracts/docs/brand-boundary.md),
[catalog 동결](../../packages/design-contracts/docs/catalog-freeze.json).
일반 모션 120/200/320ms 원칙과 다른 긴 spring은 원본의 연결·분리를 읽을 수 있게 하는 이 표현에만
국한한다. 아래 수치는 기기 측정 전 시작값이며 다른 HJM 컴포넌트 기본값으로 전파하지 않는다.

## 2. 참조 고정과 흡수 범위

참조 저장소: [rit3zh/expo-dynamic-notifications](https://github.com/rit3zh/expo-dynamic-notifications).
읽은 commit: `5de059a5cbefbe28c14efbe785166665a7c70bc5` (2026-09-18).

| 원본 파일 | 흡수할 특징 | HJM 변경 |
| --- | --- | --- |
| [geometry](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/src/core/build-notification-geometry.ts) | 성장 곡선, 목의 생성·소멸, 물방울의 세로 신장, 카드 팽창 | 고정 카드 높이 대신 측정한 콘텐츠 높이; 회전·safe area 재계산 |
| [gooey](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/src/components/dynamic-notifications/gooey.tsx) | Skia Blur + alpha ColorMatrix로 매끈한 연결, 독립 그림자 | HJM surface와 elevation, 장식 layer만 blur; 접근성 트리에서 제외 |
| [spring](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/src/conf/springs.ts) | drop/expand/reveal/tint/return의 분리 | motion 감소·중단·scene 수명 통합 |
| [timeline](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/src/hooks/use-notification-timeline.ts) | 등장·퇴장 순서와 overlap | single pending slot와 자체 timer를 버리고 HJM store 재사용 |
| content / notification-body | icon·제목·본문의 늦은 선명화 | RN 실제 Text·44pt action/close, 긴 문장·큰 글자·RTL, localized copy |

원본은 private Expo 예제 앱이다. demo feed, expo-router, 임의 avatar URL, Expo 전용 symbol,
`@/` alias, 원본 `trigger/dismiss` API를 HJM에 옮기지 않는다.
정확한 본문 blur까지 재현하는 방법은 native spike에서 비교한다. 기본 후보는 Skia 장식의 blur와
실제 RN 텍스트 opacity/scale reveal이다. 글자를 bitmap으로 바꿔 접근성을 잃는 대안은 제외한다.
이 후보가 원본과 충분히 비슷한지는 아직 미검증이며 reference 캡처 비교로 결정한다.

현재 [LICENSE](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/LICENSE)는
MIT이며 copyright 표기는 `2015-present 650 Industries, Inc. (aka Expo)`다.
코드나 상당 부분의 구현을 옮길 때 이를 임의로 저자명으로 바꾸지 않는다. 원문 고지와 저장소·commit·
차용 파일 목록을 third-party notice로 보존하고 배포 tarball에도 포함한다. 현재 HJM `files`는
`dist`, `README.md`, `LICENSE`만 포함하므로 notice를 작성하는 것만으로 배포 포함을 주장하지 않는다.

## 3. Anatomy와 배치

```text
anchor            하드웨어 정렬 장식 또는 앱 내부의 출발 캡슐
  neck            늘어났다가 끊기는 액체 연결부 (장식)
    droplet       내려오며 카드로 변형되는 덩어리 (장식)
      surface     HJM floating surface, 마지막에는 안정된 카드
        toneMark  색 없이도 의미를 전달하는 아이콘
        copy      제목 + 설명; 읽히는 실제 RN Text
        action    선택적, 한 번 실행되는 명시적 행동
        close     항상 독립된 44pt 닫기 버튼
```

### 기준 geometry (pt; 원본 기본값을 초기 기준으로 유지)

| 항목 | 시작값 | 적용 조건 |
| --- | --- | --- |
| island anchor | 126 × 37.33 | 확인된 기기 frame 대신 사용하는 범용 하드웨어 판정값이 아님 |
| capsule anchor | 88 × 24 | 하드웨어가 없는 화면에서 시각적 무게를 줄이는 HJM 시안값 |
| 카드 폭 | min(사용 가능 폭 − 32, 396) | 좌우 safe inset 제외 후 계산; 좌우 여백 각 16 |
| 카드 높이 | 최소 74, 내용으로 증가 | 원본 높이를 바닥값으로만 사용; 텍스트·action을 잘라 맞추지 않음 |
| 카드 간격 | anchor 하단 + 34 | 카드 전체가 safe content 영역 안에 들어오도록 보정 |
| droplet / neck | 52 / 60 | 원본 성장·분리 느낌의 비교 기준 |
| goo | strength .62, blur 5…20, gain 22, threshold .43 | recipe 내부값; 앱별 raw blur·gain API는 공개하지 않음 |
| 카드 모서리 | 짧은 2줄은 capsule, 높아지면 HJM large radius | action·큰 글자까지 타원으로 압축하지 않음 |

### 플랫폼별 anchor

1. **iPhone island:** 소비 앱의 검증된 host adapter가 현재 window 좌표의 anchor frame을 제공할 때만
   사용한다. 이는 실제 ActivityKit 영역을 제어한다는 뜻이 아니다. OS 영역은 터치하지 않고 장식만
   정렬한다. safe inset 숫자로 모델을 판정하거나 화면 크기 테이블로 추측하지 않는다.
2. **notch iPhone·구형 iPhone·Android:** top safe inset + 8pt에 capsule을 만든다. 등장 시작에서
   나타나고 퇴장 후 사라진다. 상태바·펀치홀·노치를 검은 막대로 덮지 않는다. Android도 원본과 같은
   neck/drop/expand를 유지한다. OS 버전이 HJM과 소비 앱 지원 범위 안이라는 전제다.
3. **가로 화면·tablet·multi-window:** 측정 영역이 충분하면 capsule, 본문·control을 가릴 만큼
   공간이 좁으면 기존 표준 Toast로 전환한다. 전환 시 같은 id·남은 시간·action revision 유지.
4. **Reduce Motion:** 캡슐·neck·drop·이동·spring 제거, 최종 카드 즉시 표시 또는 최대 120ms opacity.
   OS 설정과 HJM provider 중 하나라도 감소 모션을 요구하면 우선한다.
5. **Web:** 동일 descriptor를 기존 top Toast로 표현한다. 이 변경에서 OS 모방이나 Skia/WASM을
   도입하지 않는다. 번뚝의 완료 안내·결과 열기는 웹에서도 제공한다.

하드웨어 anchor를 앱이 안전하게 제공하지 못하면 첫 배포도 capsule이다. 아일랜드 정렬은 실제
기기 geometry가 검증된 후 켜며, 형식만 맞는 임의 rect를 production 지원 근거로 쓰지 않는다.

## 4. 모션 choreography

spring duration은 원본의 설정값이며 정확한 실제 완료 시각을 뜻하지 않는다.
검증 시 nominal offset 캡처와 실제 settle 이벤트를 함께 기록한다.

| 단계 | 원본 시작 offset / spring | 보이는 변화 |
| --- | --- | --- |
| 준비 | 콘텐츠 측정 완료 | 읽기·닫기 가능한 목표 크기를 먼저 확보 |
| drop | 0ms / 1150ms, damping .82 | anchor 아래로 물방울 성장, neck이 얇아짐 |
| tint | +110ms / 700ms, damping 1 | anchor 색에서 HJM surface로 변함 |
| expand | +340ms / 1000ms, damping .8 | 분리된 덩어리가 가로로 펴지며 약한 overshoot |
| reveal | +560ms / 700ms, damping 1 | 본문이 선명해지고 scale .88 → 1 |
| 읽기 | 내용이 읽히는 presentation 완료 후 | 기존 Toast duration 시작; 동작 없는 알림 최소 5000ms, action 기본 persistent |
| 닫기 | fade 360ms; collapse +100ms/660ms; return +280ms/1150ms | 내용 소거 → 카드 수축 → anchor 회수 |

동일 id의 진행→완료 update는 현재 카드에서 copy·tone만 갱신한다. 매번 물방울 등장부터
재시작하지 않는다. 서로 다른 알림은 기존 FIFO로 이어지며 끝나지 않은 exit를 침범하지 않는다.
퇴장 시간이 너무 느리면 먼저 실측하고 이 presentation의 return 설정만 조정한다. HJM 전체
motion token을 원본의 긴 시간으로 바꾸지 않는다.

## 5. 계약·API (v1 구현)

[ToastRegion](../../packages/react-native/src/feedback.tsx)에 presentation 주입 경계를 추가했다.
아래 API는 로컬 source에 구현되어 있고 npm에는 아직 게시되지 않았다.

```tsx
// 기본 feedback entry는 Skia를 import하지 않는다.
import { ToastRegion, useToastRegion } from '@hjmds/react-native/feedback';
import { createLiquidToastPresentation } from '@hjmds/react-native/toast-liquid';

const liquid = createLiquidToastPresentation({ anchor: { kind: 'capsule' } });

<ToastRegion placement="top" maxVisible={1}
  safeAreaInsets={insets} presentationAdapter={liquid}>
  {children}
</ToastRegion>

const toast = useToastRegion();
toast.publish({
  id: `generation:${job.id}`,
  title: t('generation.completed.title'),
  description: t('generation.completed.description'),
  closeLabel: t('common.closeNotification'),
  tone: 'success',
  presentation: 'liquid', // 새 optional hint. 생략하면 기존 standard.
  action: { label: t('generation.open'), onAction: openResult },
});
```

- `ToastDescriptor.presentation?: 'standard' | 'liquid'`: 표현 선호만 전달한다. 상태·우선순위를
  바꾸지 않는다. Web 및 adapter 없는 Native에서는 standard로 해석한다.
- `createLiquidToastPresentation({ anchor })`: 새 subpath의 제안 export. `anchor`는 capsule 또는
  검증된 island frame이며, app core에는 device 정보나 Skia 타입을 넣지 않는다.
- liquid adapter v1은 top + maxVisible 1만 지원한다. 명시적으로 잘못 조합한 설정은 validator가
  거부하고, 지원하지 않는 기기·접근성 환경은 정상 fallback으로 처리한다.
- factory가 반환하는 adapter는 HJM renderer가 정의한 닫힌 presentation 계약이다. 앱이 store와
  lifecycle callback을 직접 조작하는 render 함수는 노출하지 않는다.
- 원본의 임의 `render`·blur·gain·shared animation value 공개는 v1에서 제외한다. 자유도보다
  action·접근성·theme 계약을 보존하고, 필요한 slot은 두 번째 제품 요구를 보고 확장한다.

### 내부 경계와 의존성

```text
제품 localized descriptor
  → ToastStore (기존 한 개)
  → ToastRegion host (clock / app state / 접근성 / overlay 위치)
  → standard surface 또는 optional liquid presentation
       → 순수 geometry + Reanimated timeline + Skia 장식 + RN copy/action/close
```

contracts에는 presentation hint·resolver·시나리오와 순수 recipe만 둔다. React/Expo import 금지.
Native `toast-liquid`에 Skia·Reanimated·Worklets를 optional peer로 선언하고
granular export에서만 사용한다. 기존 feedback/root entry가 이를 재export하지 않는다.
optional peer는 missing static import를 자동 해결하지 않으므로, 기본 소비 앱에서 실제 Metro
resolution/bundle 검사를 해야 한다. 설치하지 않은 앱이 liquid subpath를 import하면 설치 오류다.
런타임 fallback은 이미 설치된 adapter의 지원 환경·motion 설정에만 적용한다.

Expo 종속 `expo-blur`, `expo-symbols`, `expo-image`는 HJM 필수 dependency로 추가하지 않는다.
현재 기준 조합은 Expo 57/RN 0.86, Skia 2.6.2, Reanimated 4.5.1, Worklets 0.10.1이다.
이는 소비 앱 manifest 관측이며 HJM의 기존 RN >=0.81 전 범위 지원을 증명하지 않는다.
optional subpath의 지원 조합을 별도로 검증·기록하고 기본 renderer 지원 하한을 올리지 않는다.

## 6. 수명·중단·접근성

- HJM queue 상한·dedupe·overflow·id별 dismiss를 그대로 사용한다. 원본의 최신 pending 한 개
  덮어쓰기 방식은 이식하지 않는다. liquid가 standard 알림보다 높은 priority를 갖지 않는다.
- 들어오는 동안 읽기 timer를 멈출 전용 `presentation` pause reason을 계약에 추가한다.
  기존 `programmatic`을 재사용하면 앱이 건 pause를 renderer가 풀 수 있으므로 분리한다.
- 측정 → entering → readable → exiting은 renderer 상태다. store의 queued/visible/closing/closed와
  이중으로 notification 소유권을 만들지 않는다. entry generation + id로 오래된 callback을 버린다.
- exit 완료는 `completeExit(id)`로 한 번만 전달한다. motion 설정 변경·background 중 exit·unmount는
  animation callback이 오지 않아도 정산하며, provider teardown의 `interrupted`와 중복 호출하지 않는다.
- background에서는 timer를 pause하고 장식 animation을 중지한다. foreground에서는 같은 알림을
  최종 카드로 복원하며 시작 연출을 재생하지 않는다. 이 pause 동안 새 pending을 보여주지 않는다.
- timer host는 monotonic elapsed delta를 먼저 정산한 다음 pause/update한다. 현재 renderer의
  timeout/snapshot scheduler를 그대로 믿고 연결하지 말고, 반복 update가 만료를 미루는지 회귀 확인한다.
- VoiceOver/TalkBack에는 한 번만 발표한다. 실제 Text·action·close만 노출하고 Skia는 숨긴다.
  announcement는 출현 시 즉시 전달하며, screen reader 사용 시 바로 읽을 수 있는 최종 카드로 전환한다.
- action은 store의 revision별 단일 실행, close는 독립된 44pt target이다. 카드 전체 탭은 기본
  navigation으로 만들지 않아 스와이프·닫기와 오동작하지 않게 한다.
- 스와이프 동안 gesture pause, 취소 시 같은 remaining으로 복귀한다. 바깥 영역은 touch-through이며
  Canvas/neck가 header·back button 터치를 가로채지 않는다.
- font scale 200%와 긴 한·영 문구는 card 측정으로 재배치한다. action은 필요하면 별도 줄로 보낸다.
  화면에 들어가지 않으면 표준 Toast로 전환한다. 필수 설명을 한 줄 ellipsis로 처리하지 않는다.
- modal·sheet의 접근성 격리를 깨지 않는다. 앱 host가 active modal 상태를 전달하여 알림 표현을
  보류하고 별도 `occlusion` pause reason으로 timer를 멈춘다. `presentation`과 분리하여 진입 완료가
  modal pause를 해제하지 않게 한다. 순서를 두 벌로 만들지 않고 기존 store를 유지한다. Native Modal 위에
  그려진다고 zIndex만으로 주장하지 않으며 modal dismiss 후 현재 유효한 알림을 보여준다.

## 7. 구현 순서와 변경 지점

1. **Native spike:** showcase 안에서 원본 geometry와 timing을 비교. capsule을 기본으로 하고
   island frame은 검증 fixture로만 주입. 텍스트 선명화 대안·native dependency 지원 조합을 확정한다.
2. **계약 확장:** Toast presentation hint, pause reason, 순수 recipe, validator/시나리오 추가.
   원본 코드 차용 시 notice·commit 표기. 기존 descriptor 입력과 store 회귀 유지.
3. **renderer:** feedback에 host/presentation seam 추가, optional subpath 구현, Web 표준 번역 확인.
   catalog는 Toast 행의 표현·evidence만 갱신하며 신규 컴포넌트 등록·stable 승격은 하지 않는다.
4. **showcase:** 기기·theme·font scale·중단·알림 폭주 fixtures. generated projection은 canonical
   sync 명령으로만 생성. 라이브러리 등록부·모듈 LIBRARY_POLICY·pack notice도 함께 갱신한다.
5. **번뚝 slice:** 생성 성공 이벤트 1회에 연결하고 실패·취소·중복 응답에서는 성공을 표시하지 않는다.
   결과는 작업 id로 연다. 모바일은 liquid, 웹은 같은 의미의 standard Toast. 제품 ADR/TASKS에
   영향 표면과 기기 증거를 남긴다. 현재 설계 변경에는 제품 source 수정이 없다.
6. **릴리스 후보:** 관련 package typecheck/test/build/pack, canonical ci:check, bundle boundary,
   실제 소비 검증 후 fixed train Changeset과 release 절차. 설치·게시·소비 완료를 각각 보고한다.

예상 파일: contracts `src/toast.ts`와 recipe, Native `src/feedback.tsx` 및 신규 `src/toast-liquid.tsx`,
Native package exports/optional peers, Web descriptor fallback, 양쪽 showcase와 renderer evidence.
정확한 내부 파일 분할은 spike 후 정하며 app 화면에 source를 복사하지 않는다.

## 8. 수용 기준과 증거

| 검증 | 완료 조건 | 현재 상태 |
| --- | --- | --- |
| 시각 참조 | source commit과 device/OS 기록; drop·neck 분리·expand overshoot·reveal·return의 동일 시점 캡처 비교 | 미실행 |
| 기기 | island iPhone, non-island iPhone, Android에서 safe area·회전·cutout·큰 글자 확인 | 미실행 |
| 행동 | A/B/C burst 순서, 동일 id update, action 2회 tap, close/exit 경쟁, queue overflow, teardown | 계약·Native mock 회귀 통과; 실제 기기 미실행 |
| 중단 | 진입·읽기·퇴장 각각 background/foreground, modal 열기/닫기, 회전, motion 설정 변경에서 유실·stuck 없음 | background·modal·늦은 callback mock 통과; 기기 회전·설정 변경 미실행 |
| 접근성 | VoiceOver/TalkBack 발표 1회, 독립 action/close, Reduce Motion, RTL, light/dark 대비 | 미실행 |
| 성능 | release/profiling build에서 동일 기기의 표준 Toast와 frame time·메모리 비교; active motion 외 draw 중단 | 미실행 |
| bundle | Skia 미설치 기본 소비 fixture가 build; liquid graph는 해당 subpath에만 존재 | 기본 Metro fixture가 optional peer import를 차단한 상태로 통과; Liquid iOS·Android Hermes JS export 통과 |
| 라이선스 | 차용 파일별 고지 및 npm pack 결과 안의 원문 notice 확인 | 계약·Native tarball의 THIRD_PARTY_NOTICES.md 확인 |
| 제품 | 번뚝 모바일 생성 완료→결과 열기, 웹 동일 의미, 실패·취소·중복 방지 | 미실행 |

성능 목표는 60Hz 기기 frame budget 16.7ms, 120Hz 8.3ms를 기준으로 기록한다. 목표는 달성
주장이 아니다. 30회 재생 전후 idle 자원·retained memory와 dropped frames를 같은 기기에서 비교하고
반복 누적·지속 draw가 있으면 수정한다. 저성능 경로는 측정 근거로 standard presentation을 선택한다.
평균 FPS만으로 transient stall을 숨기지 않는다.

iOS 일상 UI 확인은 설치된 개발 클라이언트 + 대상 루트 `expo start`, 화면 조작은 기존 Xcode
Device Hub 기기 재사용. 새 simulator를 만들거나 추가 부팅하지 않는다. 클라이언트에 필요한
native dependency가 없으면 그 범위를 미검증으로 남기고 별도 build 요청 경로를 따른다.
설계용 HTML 모션 시안은 choreography 비교용이며 RN 성능·OS geometry·기기 지원 증거가 아니다.

## 9. 설계 요청 당시의 경계 (구현 전 기록)

작성한 것: 참조·설계 결정·geometry·timeline·API 초안·플랫폼 대응·구현 순서·검증 기준.
미실행: HJM runtime 변경, dependency 설치, catalog/생성물 갱신, native build, 제품 이관, npm 게시.
설계 문서 링크 검사와 diff 검사는 해당 명령 결과로 별도 보고한다.

2026-09-28 설계 검증: `node scripts/check-doc-links.mjs`에서 144개 Markdown 링크 검사 통과.
추가 문서 whitespace 검사 통과. 별도 HTML choreography 시안에서 island/capsule 전환, 등장 scrub,
회수, 결과 열기 시안, motion 감소, light/dark, 360px 폭을 확인했다. 시안의 음수 SVG radius를
수정한 뒤 브라우저 console error 0건을 확인했다. 이 결과는 위 native 수용 기준을 충족하지 않는다.

## 10. v1 구현 기록 — 2026-09-28

Toast presentation hint·독립 pause reason·순수 geometry/recipe, Native optional subpath와 host seam,
Web standard fallback story, Native capsule/long-copy/reduced-motion story, Changeset 및 라이선스
배포 고지를 추가했다. gesture는 RN PanResponder를 사용해 Gesture Handler를 새 peer로 늘리지
않았다. body blur는 미구현이며 실제 RN 텍스트의 opacity/scale reveal과 Skia 장식 blur를 사용한다.

정확한 지원·검증 경계는 [사용 문서](../../packages/react-native/docs/liquid-toast.md)에 유지한다.
이 변경은 소비 앱의 dependency·binary·화면을 변경하거나 npm에 게시하지 않는다.

로컬 `pnpm ci:check` 통과: contracts 809개, Native 730개, Web SSR 171개·browser 771개,
Native showcase 1개·Web showcase 19개 테스트, 타입 검사, 기본 Metro bundle, 계약·렌더러
import graph 예산, 문서·governance·생성물 정합성, Web Storybook build/static 검증.
기본 Metro fixture는 Skia/Reanimated/Worklets 해석을 의도적으로 거부하므로 기본 진입점의
optional peer 비의존성을 검사한다. 별도 Liquid 쇼케이스의 iOS·Android Hermes JS export는
native binary 설치·렌더링 증거가 아니다. `npm pack --ignore-scripts`로 두 패키지에 원문 MIT
고지와 Liquid JS·타입이 들어가고 Native 패키지에 사용 문서가 포함됨을 확인했다.

Device Hub 연결은 `timeoutReached`로 실패했다. 실제 기기 시각·접근성·성능 비교는 미검증이며,
기존 Toast catalog maturity를 Liquid 모션의 검증 수준으로 해석하지 않는다.
