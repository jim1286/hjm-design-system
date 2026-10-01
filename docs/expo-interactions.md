# Expo 인터랙션 적용 가이드

검토일: 2026-10-01 · 범위: 로컬 HJM 1.10.0 기반, 미게시 변경 · 제품 채택은 별도

좋은 인터랙션은 현재 상태와 다음 행동을 설명한다. 이번 요청에서 조사한 패턴은 기존
컴포넌트에 연결한다. 새 UI kit, 전역 MotionProvider, 앱별 브랜드 통일은 필요하지 않다.
[공개 API 지도](generated/public-component-map.md), [기존 어댑터](interaction-adapters.md),
[기존 시각 확장 계획](plans/visual-and-motion-integration-2026-10-01.md)을 먼저 확인한다.
동일한 의미의 새 Button·Sheet·Transition을 만들지 않는 이유는 이미 이 세 경로가
상태·접근성·optional peer 경계를 소유하기 때문이다.

## 실제 확장 지점과 충돌

| 지점 | 기존 구현과 적용 후보 | 경계 |
| --- | --- | --- |
| 누름·비동기 피드백 | Button의 pressed/loading/busy, InlineConfirm | 서버 작업의 성공·취소·중복 방지는 제품 소유. motion 종료를 mutation 완료로 쓰지 않는다 |
| 선택 피드백 | Tabs, SegmentedControl, Switch, ReactionPicker | 선택 값·접근성 상태가 먼저 바뀌고 표시가 따라간다. 색이나 햅틱만으로 설명하지 않는다 |
| 내용 변경 | ContentTransition/TextTransition, AnimatedStatistic | 기존 fade/rise/slide/scale 사용. 문장·금액을 쪼개 읽히게 하지 않는다 |
| 행 작업 | SwipeActions | 스와이프는 버튼을 드러낼 뿐 삭제하지 않는다. 명시적 Actions 버튼, 확인/undo, 실패 복원 경로 유지 |
| 순서 변경 | SortableCollection | 짧은 단일 열. 이동 버튼/접근성 action을 함께 제공. 비활성 행·stale drag·백그라운드 취소 보존 |
| 화면·시트 | 제품 Expo Router, Sheet/GestureSheet | 플랫폼 back·dismiss 우선. screen-transition은 별도 React Navigation과 patch가 필요한 실험적 경로 |
| 입력·키보드 | 기본 RN KeyboardAvoidingView 또는 기존 HJM KeyboardAvoiding; 선택형 KeyboardFormScrollView | 동일 화면에 두 회피 레이어를 중복하지 않는다. Android resize/pan, iOS offset, 하단 safe area 실제 확인 |
| 결과·축하 | Result/Toast 후 선택형 Celebration | 확인된 성공에만 한 번. 중복 eventId, 화면 이탈, 동작 줄이기 처리. 성공의 유일한 신호로 쓰지 않는다 |

spint는 축하·스크롤 연동 장식을 금지하고, mofun은 확정 잔액으로 오해할 금액 카운트업과
서버 확인 전 성공 햅틱을 금지한다. burntok의 그리기 화면은 아래로 쓸어 닫기를 금지한다.
diairy의 편지/섬 서사, unairplane의 비행 정보, utilverse의 도구별 읽기 흐름은 제품 소유다.
따라서 이 문서는 모든 앱에 효과를 자동 적용하는 규칙이 아니다. 제품 `docs/DESIGN.md`를
확인하고 웹·앱 공통 기능 변경이면 양쪽 의미와 상태를 함께 검증한다.

## 리서치 16패턴의 채택 순서

2026-10-01 병행 리서치를 기존 API에 대응시킨 우선순위다. 아래 전 항목의 구현 완료나
현재 소비 제품의 적합성을 의미하지 않는다. 상태 복구와 명시적 조작을 먼저 확인하고
시각 효과는 뒤에 붙인다. 이번 코드 변경은 content transition의 token/중단 동작으로 한정한다.

| 순위 | 패턴 | 기존 확장 지점 · 채택할 때 확인할 조건 |
| --- | --- | --- |
| P0 | 1. 누름 | Button/IconButton: cancel, disabled, focus, scroll 전환 |
| P0 | 2. 비동기 액션 | Button loading/InlineConfirm: 동기 중복 dispatch 차단, request identity, stale completion |
| P0 | 3. 선택 | Tabs/SegmentedControl: 즉시 selected 갱신, 실측 geometry, RTL |
| P0 | 4. 화면 탐색 | 제품 Router: 중복 push 차단, interactive-back 취소 복원 |
| P0 | 5. Sheet | Sheet/GestureSheet: dismiss 경로 통일, 복귀 focus, 미저장 입력 |
| P0 | 6. 키보드 안전 폼 | 기존 keyboard 계층: 입력·CTA 노출, 회피 중복 방지 |
| P0 | 7. 필드 검증 | Field/TextField: 늦은 비동기 결과 무시, 값 보존, 오류와 필드 연결 |
| P0 | 8. 로딩 | Skeleton/EmptyState/Result: 최초·새로고침·빈 결과·오류 구분 |
| P0 | 9. 낙관적 갱신 | 제품 data/query 계층: 오래된 요청 실패가 새 변경을 rollback하지 않기 |
| P0 | 10. 피드백/Undo | ToastRegion + 제품 보상 작업: 실제 취소 가능성, 하나의 알림, focus 유지 |
| P0 | 11. 피드 갱신/페이지 | 제품 list/query: 세대별 요청, stable key, 새로고침 후 옛 페이지 차단 |
| P1 | 12. 스와이프 reveal | SwipeActions: 한 행 open, 풀스와이프 파괴 동작 금지, 대체 버튼 |
| P1 | 13. 길게 누르기 | 기존 menu/overflow: 명시적 대체 동작, scroll 경합 |
| P1 | 14. 재정렬 | SortableCollection: handle + 위/아래 이동, 취소 복원 |
| P1 | 15. 접기 | Collapsible: 숨은 자식 접근성/focus 제거, 다시 열기 |
| P2 | 16. 스크롤 헤더 | 제품 측정 이후: 새 엔진 없이 기존 scroll 흐름과 성능 검증 |

press/settle/disclose/feedback은 선택의 의미이지 새 duration 규격이 아니다. 위 기존
motion·easing·spring 중 필요한 값만 선택하고 제품의 과장 금지 규칙을 지킨다.
`AsyncButton`, `FormField`, `FeedbackHost`라는 별도 공개 이름을 이번에 만들지 않은 이유는
기존 Button/Field/ToastRegion과 의미가 겹치고 데이터/취소 경계는 제품이 소유하기 때문이다.

Undo는 알림만 지우는 동작이 아니라 취소 또는 서버 보상 작업이다. 제품이 채택할 때는
액션을 수행하거나 명시적으로 닫을 때까지 유지하는 경로를 우선 검토한다. 타이머 만료만으로
접근 가능한 유일한 복구 기회를 없애지 않는다. 알림은 focus를 빼앗지 않고 필요한 내용만
한 번 알린다. 이는 이번 Toast 기본 timeout을 바꾸는 변경은 아니다.

출처 연결: [RN Pressable](https://reactnative.dev/docs/pressable),
[RNGH 2.x Swipeable](https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/components/reanimated_swipeable/),
[Material Snackbar 지침](https://m3.material.io/components/snackbar/guidelines).
Material 페이지는 이 실행 환경에서 JavaScript 본문을 읽을 수 없었으므로 부모 리서치가
전달한 Undo 권고를 채택 후보로 기록했으며 직접 원문 검증을 주장하지 않는다.
외부 소스 코드를 복사하지 않았고 앱 팔레트/레이아웃을 외부 서비스 스타일로 교체하지 않았다.

## 모션 토큰과 실행 규칙

- 시간: `@hjmds/design-contracts/foundations`의 `motion.fast/normal/slow` = 120/200/320ms.
  `easing.enter`와 기존 spring을 재사용하며 새 전역 시간을 추가하지 않는다.
- 공간: `@hjmds/design-contracts/content-transition`의 `contentTransitionMotion`은
  `rise: 12`, `slide: 16`, `scale: 0.96`. 기존 표시값을 공개한 것이며 화면 크기의 비율이나
  gesture 활성화 임계값이 아니다. Native는 dp, Web은 CSS px로 기존 resolver가 소비한다.
- ContentTransition은 200ms entrance curve를 사용한다. 첫 mount는 정적이고 `stateKey` 변경만
  재생한다. 같은 key의 부모 재렌더로 재생하지 않는다. 빠른 연속 변경은 이전 재생을 취소하고
  최신 내용 하나만 유지한다. preset/방향 변경은 진행 중 움직임을 중단하고 정착한다(Native).
- 동작 줄이기 또는 `motion="none"`에서는 변형·fade 모두 생략한다. foundations의 일반
  enter preset이 opacity 대안을 허용해도 이 컴포넌트의 더 엄격한 정적 동작을 완화하지 않는다.
- Native background는 현재 내용에 정착하고 unmount는 애니메이션·listener를 정리한다.
  유지되는 숨은 route는 호스트가 `motion={focused ? 'system' : 'none'}`로 비활성화한다.
  모션은 네트워크 응답이나 접근 가능한 내용을 지연시키는 조건이 아니다.

HjmNativeProvider는 이미 RN AccessibilityInfo의 초기 조회와 `reduceMotionChanged`를
구독한다. 제품이 explicit `reducedMotion`/provider value를 주면 그 값의 실시간 갱신도
제품 책임이다. Reanimated의 `useReducedMotion`은 시작 시점 값이므로 이것만으로
실행 중 설정 변경을 대체하지 않는다. [Reanimated 접근성 문서](https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/).

햅틱은 HJM에 Expo 의존성을 강제하지 않고 제품의 확인된 이벤트 경계에 둔다. selection과
성공을 구분하고 드래그 매 프레임·렌더마다 발생시키지 않는다. 중복 요청이나 취소 후 늦은
응답은 재발생시키지 않으며 사용자 설정/플랫폼 미지원·실패가 작업 완료를 막지 않게 한다.
동작 줄이기를 햅틱 허용의 자동 근거로 삼지 않는다.

## 취소·제스처·접근성

터치 시작에 저장하지 말고 유효한 press/gesture 확정에 의도를 전달한다. 스크롤로 전환된
누름, 경계 밖 release, gesture cancel은 원래 상태로 돌아와야 한다. 수평 carousel/swipe와
수직 ScrollView의 판정은 기존 adapter/엔진이 소유한다. 상위 전체 화면 PanResponder로
터치를 가로채지 않는다. Sheet 내부 scroll, 시스템 edge-back, 키보드 dismiss, Android back을
각각 확인한다. 예제의 ContentTransition은 responder를 추가하지 않는다.

제품 비동기 작업은 idle → pending → success/error 상태를 명시하고, 요청 ID/abort 신호로
취소·재시도 이후 늦은 결과를 무시한다. 잠금은 네트워크 호출 직전 동기적으로 잡는다.
시각적 로딩 버튼만으로 중복 실행이 예방됐다고 보지 않는다. undo의 유효 시간·서버 복구
가능성을 제품이 정의하고, 실패는 원래 값과 재시도를 보존한다.

이름·selected/busy/disabled 상태, 텍스트 결과와 명시적 대체 버튼을 제공한다. 한 내용의
exit 복사본을 접근성 트리에 남기지 않는다. 내용 전환이 자동 focus 이동이나 iOS 음성
announcement를 보장하지는 않는다. 필요한 완료 알림과 focus 목적지는 제품이 선택한다.
VoiceOver/TalkBack, 큰 글자, RTL, 읽기 순서와 반복 알림을 기기에서 확인한다.

## Expo 실행 범위

| 항목 | 확인한 로컬 선언 | Expo Go / development build |
| --- | --- | --- |
| HJM Native 기본 peer | RN >=0.81, React >=19 | peer 범위는 모든 버전의 실제 검증 증거가 아니다 |
| Native showcase | Expo ~57.0.25, RN 0.86.2, React 19.2.3 | 전체 gallery는 optional native module 때문에 기존 linked dev client 필요 |
| 소비 Expo 앱 | Expo 57.0.24–26, RN 0.86.2–3, React 19.2.3 | 소비 manifest 기준. 설치 바이너리/Expo Go의 포함 모듈 버전은 따로 확인 |
| ContentTransition + Button/Text 예제 | RN Animated만 사용, 새 peer 없음 | SDK와 RN이 맞는 Expo Go에서 사용할 구조. 이번 작업에서 Go 기기 실행은 미검증 |
| 제스처/고급 모션 | 주로 Reanimated 4.5.1, Worklets 0.10.1, GH 2.32.0 | Go의 번들 버전과 일치해야 함. 임의 JS 업그레이드로 바이너리 호환을 가정하지 않음 |
| unairplane | 위 세 모션 peer를 선언하지 않음 | 기본 ContentTransition 가능 범위와 optional gesture 도입을 구분 |
| Keyboard Controller | 선택형 `/keyboard-controller`, 설치 1.22.5 | SDK 57 reference는 Go 포함·권장 1.21.9. 현재 설치값이 다르므로 이 checkout의 Go 호환은 미검증 |
| Skia/축하/플랫폼 메뉴/공유 화면 | optional 엔진 또는 native host 필요 | 전체 showcase의 지원을 개별 Expo Go 지원으로 표현하지 않음 |

[Expo 키보드 가이드](https://docs.expo.dev/guides/keyboard-handling/)와
[SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/sdk/keyboard-controller/)의 Go 안내가
서로 다르므로 버전이 고정된 reference를 우선한다. 모든 Keyboard Controller 사용에 dev build가
필수라고 단정하지 않는다. 설치된 1.22.5와 reference의 1.21.9 차이는 현재 Go 검증 부채다.
이 표는 manifest/설치 패키지와 문서의 구분이며 SDK 57 바이너리 인증이 아니다.
[Reanimated 호환 표](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)상
4.x는 New Architecture와 호환 Worklets가 필요하다. 현재 4.5.x/RN 0.86/Worklets 0.10.x는
표의 범위 안이지만 기기 실행 증거와 구분한다. 3.x에 Worklets를 추가해 같은 경로라고
가정하지 않는다. 새로운 dependency나 lockfile 변경은 없다. 설치 RNGH 2.32.0에는 3.x 기본 문서 대신
[2.x 문서](https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/)를 참조한다.

showcase 설치값은 Gorhom 5.2.14, React Navigation 7.4.1, Keyboard Controller 1.22.5이다.
GestureSheet는 이미 `enableDynamicSizing={false}`라 content snap point 삽입이 없다.
이를 켜는 확장에서는 인덱스를 영속 상태로 쓰지 말고 compact/expanded 의미와 실제 위치를
매핑한다. 현재 snap index 계약은 바꾸지 않는다. Reanimated 자체 shared-element와
HJM의 별도 screen-transition 어댑터를 같은 구현으로 취급하지 않으며 둘 다 core 자동 도입
대상에서 제외한다. 후자는 기존 실험 상태와 소비 앱 router 호환 제약을 유지한다.

## 최소 예제와 검증

Native Storybook **패턴 / Expo 인터랙션 복구**의 Default/Dark/LargeText에서 현재 상태 변경,
초기화, 닫기/다시 열기, 동작 줄이기를 조작한다. 기존 provider와 Button/Text/ContentTransition을
합성하고 네트워크·타이머·새 renderer를 추가하지 않는다. 소비 앱을 수정하지 않는다.

1. 빠른 연속 입력에서도 최신 내용 하나가 보이는지 확인한다.
2. 전환 중 동작 줄이기 또는 닫기를 실행하고 다시 열 때 이전 모션이 이어지지 않는지 본다.
3. OS 동작 줄이기를 실행 중 전환하고 background/foreground를 왕복한다.
4. ScrollView 스크롤·큰 글자·RTL·읽기 순서를 iOS/Android에서 확인한다.

예제는 개발용이다. 설치된 호환 dev client와 기존 기기를 재사용하고 showcase/native에서
`pnpm storybook`(expo start)로 실행한다. 예제를 보려고 새 native build나 기기를 만들지 않는다.

ContentTransition은 opacity/transform만 native driver에 보낸다. 매 프레임 setState나 layout
측정은 없다. 긴 목록의 모든 행을 동시에 감싸지 말고 변화한 영역에만 적용한다. release/dev
성능을 구분하고 저사양 Android/실제 iPhone에서 frame time, dropped frames, 메모리·발열을
비교하기 전에는 60/120fps나 GPU 비용을 보장하지 않는다. 이번 테스트는 엔진 mock이다.

검사 결과와 아직 실행하지 않은 환경은 [이번 작업 기록](evidence/expo-interactions-2026-10-01.md)에 남긴다.

## 제품 적용 기준 · 2026-10-02

[상호작용 적용·품질 기준](INTERACTION_QUALITY.md)의 예제 목록과 상태·성능 검증을 따른다.
현재 예제는 `배포/구성/Expo 인터랙션 복구`에 있으며 새 공통 실행·복구 예제는 `실험/구성`에서 검토한다.
