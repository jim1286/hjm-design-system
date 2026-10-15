# 선택 버튼의 실제 반응과 수치

상태: 배포 · 적용: 미게시(1.20.0 이후) · 검토일: 2026-10-15

Lucian 006 구독 리플·012 북마크 리본·022 선택한 좋아요 burst는 같은 counted selection이다.
구독·북마크·좋아요의 별도 상태 엔진을 만들지 않고, 기존 Button.selected와 AnimatedStatistic,
기존 action-session의 낙관적 제안·직렬화·실패 복구를 한 optional 구성으로 합성한다.
배치와 코드는 [사용 지침](usage/compositions/toggle-feedback.md)에 있다.

## 선택 기준과 의존성

- 단순 selected 표현은 기존 `Button`/`IconButton`, 프로필 정보가 같이 필요하면
  `FollowProfileCard`, 메시지 반응 목록이면 `ReactionPicker`를 쓴다.
- `NotificationBell`은 읽지 않은 알림 인원의 일방향 알림이다. 사용자 구독 상태를 바꾸는
  mutation과 구분한다. `Celebration`은 전체 뷰포트 canvas/Confetti 계층이라 버튼의 작은
  리플·리본·방사형 burst를 대신하지 않는다. 새 confetti 엔진이나 전역 canvas를 추가하지 않는다.
- `ToggleFeedbackButton`은 `@hjmds/{react,react-native}/toggle-feedback`에서만 제공한다.
  카탈로그에 세 도메인 이름을 추가하지 않는다. Web은 AnimatedStatistic의 기존
  `@number-flow/react`, Native는 기존 `react-native-svg` peer를 사용한다.
- 아이콘은 제품 `icon` 또는 `renderIcon({selected,pending})` 슬롯을 우선 사용한다.
  기본 도형은 해당 effect의 벨·북마크·하트이며 장식 레이어다. 문구·locale·브랜드는 제품과 HJM semantic token 소유다.

## 확정 상태와 요청

`ToggleFeedbackState`의 selected/count는 제품 서버가 확인한 상태다. count는 현재 사용자를
포함하는 음이 아닌 안전 정수다. `resolveToggleFeedbackProposal`은 중복 선택 delta=0,
선택 경계 delta=±1인 동결 snapshot을 만들며 불가능한 count·overflow를 거부한다.
이 snapshot을 pending 동안만 표시한다. 새 confirmed count가 도착해도 delta를 다시 더하지 않는다.

`onSelectedChange`는 실제 요청을 실행하고 서버 결과로 제품 state를 갱신한 뒤 resolve한다.
거절하면 현재 confirmed props로 돌아가며 오류를 읽어 주고 다시 선택할 수 있다.
기존 private `useCompositionAction<T=string>`이 shared action-session을 재사용하므로
동일 tick 연속 호출·중복 서버 요청을 막는다. default string은 기존 소비처와 호환된다.
profile/event 구성도 동일 typed helper를 쓰며 문자열 JSON 직렬화가 필요 없다.
`entityId` 교체는 내부 범위를 remount해 이전 응답이 새 카드 오류를 바꾸지 않게 한다.
실제 서버 취소·캐시 반영 위치·인증·idempotency는 제품이 책임진다.

## 모션

- 선택하지 않음→선택에서만 효과를 한 번 시작한다. 초기 selected, 해제, 테마/활성 복귀는 재생하지 않는다.
- ripple: SVG circle 반경이 확대되면서 사라진다. ribbon: 아이콘이 위로 당겨졌다 제자리로 돌아온다.
  burst: 하트 주변 8방향 선분이 퍼지며 사라진다. 기본 아이콘의 최종 채움은 selected와 함께 유지된다.
- 총 시간은 `toggleFeedbackRecipe.duration = motion.slow = 320ms`. 공통 geometry resolver를
  Web requestAnimationFrame과 Native Animated.Value가 host SVG/transform에만 적용한다.
  프레임마다 React state를 갱신하거나 가짜 count를 확정하지 않는다.
- reducedMotion, `active=false`, document hidden/AppState background에서는 중간 장식을 제거한다.
  앱이 돌아와도 소비된 선택 효과를 다시 재생하지 않는다. 해제는 장식 없이 상태·수치만 바꾼다.
- counter 전환은 기존 AnimatedStatistic이 맡으며 접근성에는 최종 숫자만 전달한다.

## 검증 범위

계약 검사는 실제 count delta·동결과 세 효과 geometry를 확인한다. Web은 DOM에서 요청 거절·중복·
엔티티 교체, 세 효과의 실제 host 변화와 프레임 React commit 부재, 백그라운드 정지·감소 모션,
두 팔레트 light/dark의 좁은 본문을 검사한다. Native는 host mock으로 각 효과 시작·해제의 침묵,
감소 모션·활성화·AppState 정지와 counted mutation 실패 복구를 확인한다.
실기기 Release 성능·제품 서버·npm 게시·제품 적용은 이 로컬 검사의 증거가 아니다.
