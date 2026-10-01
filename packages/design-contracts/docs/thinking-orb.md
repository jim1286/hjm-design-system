# ThinkingOrb — AI 작업 상태

검토일: 2026-10-01. 원본: [Thinking Orbs](https://github.com/Jakubantalik/thinking-orbs/tree/de85557ca220332586d070d8788c0e1d6e877a0d), MIT.

## 결정과 범위

사용자가 Thinking Orbs의 HJM 흡수를 요청했다. catalog 동결의 이번 예외는 실제 AI 작업의
검색·듣기·생성 상태를 표시하는 컴포넌트 하나다. 기존 Spinner를 대체하거나 장식용으로
자동 순환시키지 않는다. upstream 패키지를 runtime dependency로 연결하는 대신 고정 커밋의
기하 엔진·튜닝만 편입한다. 두 renderer가 같은 엔진을 사용하고 HJM의 테마·접근성·생명주기를
유지해야 하기 때문이다. 원본 고지는 배포 패키지의 THIRD_PARTY_NOTICES.md에 포함한다.

## API

웹은 `@hjmds/react/thinking-orb`, Native는 `@hjmds/react-native/thinking-orb`.
공통 계약은 `@hjmds/design-contracts/components/thinking-orb`로만 가져온다.
선택형 코드가 일반 컴포넌트 번들에 들어가지 않도록 root barrel에서는 재수출하지 않는다.

```tsx
<ThinkingOrb state="searching" size={64} label={t('agent.searching')} active={screenVisible} />
```

- `state`: working, searching, solving, listening, connecting, weaving, composing, breathing, shaping.
  실제 상태를 앱에서 전달한다. listening은 음성 크기에 반응하는 오디오 시각화가 아니다.
- `appearance`: 기본 `state`는 상태별 원본 기하를 유지한다. `fluid`는 물결치는 점 고리, `matrix`는 원형 점 격자로 독립 구현한 표현이다. 실제 진행률이나 음성 신호를 나타내지 않으며 기존 정지·가시성·모션 줄이기 규칙을 공유한다.
- `size`: 20 또는 64. 원본의 점 수·반지름 튜닝을 유지하며 임의 CSS 확대는 지원하지 않는다.
- `label`: 필수. 앱에서 번역한 현재 작업 설명. 완료·오류 때는 별도 결과 UI로 교체한다.
- `speed`: 기본 1, 유한수 0 초과 4 이하. 무제한 속도는 읽기 어려운 모션을 만들므로 제한한다.
- `paused`: 프레임 시간을 유지. 재개 시 숨겨진 시간만큼 건너뛰지 않는다.
- `active`: 기본 true. Native의 탭/내비게이션/가상 목록에서 보이지 않을 때 false를 전달한다.
  AppState만으로는 여전히 mounted인 숨긴 화면을 알아낼 수 없기 때문이다.

HJM provider의 `text` 색을 깊이에 따른 opacity와 조합한다. 원본의 고정 grayscale 팔레트는
브랜드 테마와 배경에서 어긋날 수 있어 사용하지 않는다. `appearance="state"`의 기하 좌표는 원본과 동일하다.
모션 줄이기에서는 elapsed 0.6초 프레임만 그린다. 긴 JS 정체 후 이동은 최대 64ms로 제한해
순간적인 모션 점프를 줄인다. 상태 전환은 새 모양으로 즉시 바뀌며 morph 전환은 제공하지 않는다.
웹은 role=status와 숨긴 텍스트, Native는 접근 가능한 progressbar host를 사용한다.
Canvas는 접근성 트리에서 제외한다. 외부에 문구를 함께 표시할 때 중복 live region을 두지 않는다.

## 호환성과 증거 경계

웹: React 19 + Canvas 2D. IntersectionObserver, document visibility, provider reduced motion에 반응.
Native: 선택형 Skia 2.6.2 + Reanimated 4.5.1 + Worklets 0.10.1, Expo 57/RN 0.86.2 조합을 검증 대상으로 한다.
기본 renderer의 RN >=0.81 계약이 이 선택형 효과의 지원 범위를 보장하지 않는다.
Skia Picture를 shared value로 전달해 매 프레임 React commit을 피하지만 기하 계산과 picture
recording은 JS thread에서 실행한다. UI worklet 기반이라는 주장은 하지 않는다.

원본 Native는 기기 미검증을 명시하지만, HJM은 아래 설치 smoke를 별도로 수행했다.
HJM Native 승격 조건은 실제 설치 앱에서 Skia가 그려지는 기본 smoke를 iOS와 Android에서 확인하는 것이다. 이 gate는 선택형 네이티브 모듈과
렌더러 연결을 확인한다. Metro bundle과 mock lifecycle 검사만으로 이 연결을 증명할 수 없기
때문이다.
Web 승격에는 showcase manifest의 dark·large-text·RTL·reduced-motion·accessibility 행렬을
실제 browser renderer에서 확인해야 한다. 제품 채택 수와 제품 화면의 VoiceOver/TalkBack 확인은
소비 앱 QA이며 HJM renderer 성숙도의 추가 gate가 아니다([stable-promotion.md](stable-promotion.md)).
Native smoke는 각 OS에서 설치 앱의 대표 상태 한 가지를 light/dark theme으로 렌더링하고 label이
포함된 progressbar host를 확인한다. 9개 상태·두 크기의 geometry와 host 접근성 속성은 Native
renderer 테스트에서 확인하며 reduced-motion·navigation·background/resume lifecycle도 mock
회귀 테스트에서 확인한다. 이 분리는 모든 조합의 실제 device 캡처와 장시간 메모리 stress를
승격 gate로 요구했던 이전 안이 소비 앱 QA와 성능 보증까지 HJM maturity에 넣었기 때문이다.
VoiceOver/TalkBack 사용성은 소비 앱에서 확인하고, 성능 stress는 실측 이슈나 성능 주장이 생길
때 수행한다. Native는 아래 iOS·Android smoke와 renderer matrix 통과 후 stable로 승격했다.

원본 golden fixture 72개는 engine 좌표·반지름·깊이·정렬을 비교한다. Canvas lifecycle 검사는
정지/재개/viewport/테마를 확인한다. default renderer proof와 실측 모션/성능 증거는 구별한다.

## 이번 checkout 검증 — 2026-09-29

- 공통 계약 테스트 883개(원본 72개 golden 포함), Web SSR 172개, Web Chromium 773개,
  Native mock 731개 통과. 공개 export 목록 갱신 후 실패했던 경계 검사를 재실행했다.
  Native 기존 provider-theme 테스트는 병렬 부하에서 timeout 후 worker 2개로 전체 재실행해 통과했다.
- Web showcase 테스트·token 검사·production build 통과. 112 canonical story 중 97 Web renderer.
  실제 브라우저에서 AllStates의 9상태 × 20/64, light/dark 화면 확인.
- Native showcase typecheck/test, 기본 Metro Android production fixture 통과. ThinkingOrb Native
  mock renderer regression now covers all 9 states × 2 sizes × 2 themes and lifecycle; this is not
  installed-app Skia runtime proof.
  Expo 57 showcase의 iOS/Android Hermes export 성공. 이것은 native binary 설치/실행 증거가 아니다.
- contract/renderer bundle 예산, workspace/evidence 동기화, 문서 링크, release governance,
  중앙 library-policy 정적 검사 통과. 원격 CI·게시·소비 앱 적용은 실행하지 않았다.
- 기존 Device Hub 프로세스와 부팅된 iPhone 18 Pro / iOS 27.0을 확인했지만,
  `com.apple.dt.Devices` 화면 조회는 `timeoutReached`로 실패했다. 새 기기를 만들거나
  부팅하지 않았으며 Native visual/performance/assistive-technology 증거는 미완료다.

### 설치 smoke 전 자동 검증 — 2026-09-29

Native renderer 테스트가 820개로 확장되어 ThinkingOrb의 9상태 × 두 크기 × 두 테마,
접근 가능한 progressbar host와 숨긴 Canvas semantics, reduced-motion/navigation/background
lifecycle을 확인한다. React Native typecheck와 canonical `pnpm ci:check`가 통과했다.
이 검사는 mock renderer 범위다. iOS·Android 각각의 설치 앱에서 Skia가 실제로 그려지는 smoke는
아직 실행하지 않아 Native surface는 planned로 유지한다.

### 설치 앱 검증 및 Native 승격 — 2026-09-29

- 기존 iPhone 17 시뮬레이터(iOS 27.0)와 Android emulator-5554(Android 16/API 36)에서
  설치된 HJM showcase의 Skia 렌더링을 확인했다. 물리 기기 검증은 아니다.
- 두 OS 모두 9상태 × 두 크기 light/dark 화면을 확인했다. 접근성 snapshot에서
  `검색 중` label과 busy 상태를 확인했다. iOS는 UpdatesFrequently trait, Android는
  focusable host를 노출한다. progressbar React Native prop은 renderer 테스트로 확인하며
  OS snapshot의 GenericElement/View 표기를 별도 progressbar class로 과장하지 않는다.
- Android background 후 Playground 복귀 화면도 확인했다. 5개 환경 scenario와 canonical
  default-render proof를 추가했으며 관련 renderer 검사 88개가 통과했다.
- iOS 최초 실행은 UIScene 누락으로 SIGTRAP 종료됐다. Expo ~57.0.25와 scene lifecycle
  config plugin 적용 후 빌드(오류/경고 0), 설치, 실행, light/dark 전환이 성공했다.
  개발 서버는 RCT_jsLocation=localhost:8084로 연결했다.
- Device Hub 조회는 timeoutReached로 두 번 실패하여 같은 시뮬레이터에서 simctl 캡처와
  idb 접근성 조회로 검증했다. 새 기기는 만들거나 부팅하지 않았다.
- iOS는 ThinkingOrb 집중 profile로 unrelated menu adapters를 제외했다. 전체 optional
  showcase의 RCT-Folly 충돌을 해결했다는 뜻은 아니다. VoiceOver/TalkBack 제품 QA,
  장시간 성능 검증, 게시 및 소비 앱 적용은 이 smoke 범위 밖이다.

[캡처와 접근성 증거](../../../docs/evidence/thinking-orb-2026-09-29/README.md),
[재현 절차](../../../showcase/native/README.md),
[호스트 수정 근거](../../../docs/LIBRARY_POLICY.md)를 함께 유지한다.

### 설치 smoke 후 최종 검사 — 2026-09-29

Contracts 885, React SSR 174 + Chromium 886, React Native 826, Web Showcase 19,
Native Showcase 1: 기능 테스트 총 2,791개 통과. 승격 과정에서 Native evidence export 목록과
Storybook registry 누락을 수정해 해당 검사를 다시 통과했다. Evidence 메타데이터는
10.7 kB raw / 2.72 kB gzip으로 늘어 한 모듈 graph 유지 확인 후 예산만 갱신했다.
`pnpm ci:check` 단일 실행은 기존 evidence budget에서 중단되었고, 수정 후 그 단계부터
나머지 canonical 명령을 순서대로 재실행하여 모두 통과했다. 최종 전체 명령을 다시
한 번 실행했다고 주장하지 않는다. Renderer/contract budgets, Android Metro fixture,
workspace/evidence/docs/governance, 양쪽 showcase 검사, Web Storybook build 및
112 canonical story inventory, 중앙 library-policy 정적 검사, `git diff --check` 통과.
게시·소비 앱 갱신은 실행하지 않았다.

## Storybook 탐색

Web/Native 모두 `컴포넌트/피드백/ThinkingOrb`에서 Default, Dark, LargeText를 제공한다.
Fluid와 Matrix는 같은 컴포넌트의 표현 예제이며 새 상태 엔진이나 진행률 계약을 추가하지 않는다.
2026-10-01 추가 표현의 Native 실제 화면 확인은 아직 미완료다.
