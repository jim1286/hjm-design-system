# QA 리포트 — 정적 질감 비교 실험

## 1. 최종 판정

부분 확인. noise 레이어와 Web/Native 비교 스토리를 추가했다. 장식 표시·입력·버튼의
일부 실제 흐름을 확인했으며 승격·릴리스·소비 앱 채택은 아직 하지 않았다.
실행: 2026-10-07 04:19 KST부터, Codex.

## 2. 대상과 이력

HJM main 12fb8b2 위 미커밋 변경. 기존 EffectSurface의 grain을 유지하고 opt-in noise를
추가했다. 별도 컴포넌트·GPU peer·외부 이미지 요청을 추가하지 않았다.
생성기는 고정 seed의 6 octave periodic value noise를 64×64 PNG alpha mask로 만든다.
원본 SVG Perlin noise의 구현·픽셀 동등성을 주장하지 않는다.

## 3. 환경과 검증 범위

- Web: Codex IAB, localhost:6006 개발 Storybook, light, 1280×720. 브라우저 버전 미기록.
- Native: 기존 iPhone 17 Pro/iOS 26.5 시뮬레이터, Expo Go 57.0.9/Metro 8084, light.
  사용자 지침에 따라 idb·simctl을 사용했다. Device Hub UI/실물 Release 검증이 아니다.
- 예제 내부 상태만 사용하며 서버 저장이나 실제 제품 데이터는 없다.
- 로컬 검사: Node 24.20.0/pnpm 11.18.0.

## 4. 확인 결과·발견한 문제·재현과 수정

| 시나리오 | 결과 | 판정 |
| --- | --- | --- |
| Web noise 메모 입력 후 강도 22%→60% | `질감 변경 후 유지` 값 유지, 불규칙한 질감 표시 | 통과 |
| Web 질감 위 버튼 선택 | `불규칙 질감에서 눌렀어요.` 결과 표시 | 통과 |
| Native noise 표시·입력 | 정적 마스크 표시, 키보드가 열린 뒤 42 입력 확인 | 통과 |
| Native 키보드를 유지하고 본문 위로 스크롤→버튼 | 입력 42 유지, 버튼과 선택 결과에 접근 | 통과 |
| Native 키보드가 열리기 전 즉시 입력 명령 | 입력 미반영. 키보드 열린 상태에서 다시 입력해 확인 | 도구 타이밍 한계 |

Native SVG 15.15.5의 FeTurbulence는 경고 후 null을 반환한다. 웹 필터를 그대로 복제하면
Native 장식이 사라지므로 생성된 공용 PNG mask를 사용했다. 처음에는 100 단위 viewBox에
타일을 넣어 긴 Web 영역에서 질감이 늘어났다. noise는 바깥 SVG의 고정 64 단위 pattern으로,
기존 mesh/glow/grain은 내부 100 단위 SVG로 분리했다. 최종 Web 화면에서 미세 질감을 확인했다.

## 5. 검사·관찰 결과

첫 ci:check는 effect-surface의 모듈 4개가 기존 제한 3개를 넘어 실패했다. import를 직접
검토한 결과 effect-surface→color-references→colors와 import 없는 internal/effect-noise뿐이었다.
새 정적 자산 한 개를 명시적으로 허용하도록 해당 entry 제한만 4로 바꾸고 이유를 주석에 남겼다.
금지 metadata·peer·barrel 검사와 다른 entry 제한은 유지했다. 측정은 약 13.7 kB raw,
8.2 kB gzip이며 기존 보고 기준 7,100/2,650 bytes보다 크다. noise를 사용하지 않더라도
EffectSurface entry를 가져오면 자산 모듈이 그래프에 포함된다. 런타임 성능 측정값은 아니다.

최종 `pnpm ci:check` exit 0. Contracts 961, Web Node 278/브라우저 1,093,
Native 1,190, Showcase Native 18/Web 43 테스트 통과. Storybook production build와
103 canonical/13 navigation 정적 검증 통과. renderer graph는 Web 4/Native 2 모듈로
기존 경계를 유지했다. 이 결과는 Android production bundle 생성까지 포함하지만
Android 기기 표시·상호작용을 증명하지 않는다.

## 6. 미확인 범위와 후속 조건

Android 실제 합성, VoiceOver/TalkBack, 다양한 제품 팔레트·대비, Native 다크/큰 글자/RTL,
모션 활성화와 수명주기 실제 관측, 실물 Release 성능·원본과 동일 조건 비용은 남아 있다.
60%는 비교 스트레스 조건이며 제품 기본 권장이 아니다. 전수조사 완료나 승격 근거로 확대하지 않는다.

## 7. 보관 처리

관측 결과는 이 리포트와 후보 ledger에 보존한다. 종료한 검사의 원시 로그·캡처는 결과 대조 후
제거하고, 생성기·정적 자산·회귀 fixture 및 실행 중인 Metro/Storybook 로그는 보존한다.
