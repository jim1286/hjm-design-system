# QA 리포트 — 숫자 효과 원본 대조

## 최종 판정·대상

부분 확인. 2026-10-07 03:25 KST, Codex. HJM main 284e6c8 위 미커밋 Showcase 양쪽
AnimatedStatistic 비교 스토리와 사용 지침. Runtime API/엔진 변경 및 신규 승격은 없다.
기존 배포 항목의 검증 변형 5개를 더했으며 실험 수는 13개로 유지한다.

## 조사와 결정

[공식 Number Ticker 소스](https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/number-ticker.tsx)는
in-view 이후 spring 중간 값을 en-US로 표시한다. IAB 1280×720 light 기본 데모에서
중간 4, 이후 최종 100을 관찰했다. 이 동작만으로 HJM Intl/fallback 엔진을 교체하지 않는다.
실제 확정 값과 숫자 표현을 보존하는 비교 예제를 기존 스토리에 추가했다.

[공식 Scroll Progress 소스](https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/scroll-progress.tsx)는
명시적 container 없이 useScroll을 사용한다. 기존 HJM host/Progress 계약을 유지한다.
[Noise Texture 문서](https://magicui.design/docs/components/noise-texture)는 feTurbulence 기반이다.
현재 HJM grain의 반복 점 패턴과 같다고 판단할 수 없다. 질감 흡수 여부는 미결로 남긴다.
이 두 항목은 이번에 소스만 대조했고 실제 화면 검증 완료로 세지 않는다.

## 환경·재현·결과

Web IAB localhost:6006, 개발 Storybook, 1280×720 light, 브라우저 세부 버전 미확인.
합성 로컬 측정값이며 API/계정 없음. Native는 이번 변경의 자동 검사만 수행했다.

| 시나리오 | 기대 | 관찰 | 판정 |
| --- | --- | --- | --- |
| ar-EG 증가 | locale 유지 | ١٬٢٣٤٫٥ → ١٬٣٥٩٫٥ | 통과 |
| ar-EG 초기화 | 비라틴 0 유지 | ٠ | 통과 |
| de-DE 음수 감소 | 부호·구분자·소수 유지 | -1.234,50 → -1.359,50, AX 최종 값 | 통과 |
| 원본 기본 진입 | 목표 숫자 도달 | 4 관찰 후 100 도달 | 해당 데모만 확인 |

소수·음수는 기록 개수가 아니므로 예제 이름을 측정값으로 구분했다. 음수를 허용하고 0으로
되돌리는 제어를 추가했다. Web/Native 모두 Decimal·NonLatinDigits·Scientific·ReducedMotion·Rtl
변형이 있으며, 변형 존재를 실제 기기 검증 완료로 세지 않는다.

## 검사

Node 24.20.0 / pnpm 11.18.0. Showcase Native check(typecheck + 18 tests), Web check
(typecheck + 43 tests + token 검사) 통과. 마지막 예제 라벨 수정 후 두 typecheck를 다시 통과했다.
storybook:check는 409 files / 905 Web ids, usage:check 통과. 최종 docs:check·diff 검사도 수행한다.
기존 숫자 runtime은 수정하지 않아 package 전체 테스트·production build는 이번에 반복하지 않았다.

## 남은 범위

원본 소수/start-value·reduced motion·스크린리더, Native 실제 변형, Web Scientific/RTL/다크/큰 글자,
두 제품 팔레트·성능은 후속 검증 대상이다. 숫자 모션의 모든 프레임을 캡처해 분석한 것은 아니다.
Scroll Progress/Tracing Beam 실제 읽기 흐름과 Noise Texture 양 플랫폼 시각·비용 비교도 남는다.
전체 사이트 조사, 실험 승격, npm 릴리스, Utilverse 채택 완료를 뜻하지 않는다.

## 보관 처리

원시 AX/브라우저 캡처는 별도 파일로 저장하지 않았다. 완료 Native/Web 검사 로그는 결과를 이
문서와 대조한 뒤 제거한다. 비교 스토리·사용 지침·URL ledger·story id registry는 유지한다.
