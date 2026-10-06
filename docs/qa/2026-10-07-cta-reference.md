# QA 리포트 — CTA 레퍼런스와 소개 화면 복구

## 1. 최종 판정

부분 확인. 기존 소개 실험의 CTA·초안·복구 흐름을 Web와 iOS 개발 환경에서 확인했다.
11개 사이트 전수 검토, 전체 환경 검증, 실험 승격·npm 게시·Utilverse 적용 완료는 아니다.
마지막 확인: 2026-10-07 03:20 KST.

## 2. 대상과 이력

HJM main 893cf45 위 미커밋 ProductBentoPreview(Web/Native), 사용 지침·레퍼런스 기록.
수행자: Codex. 기존 실험을 보강했으며 실험 항목 수는 13개로 유지한다.

| 시각(KST) | 대상 | 수정 전·후 | 결과 |
| --- | --- | --- | --- |
| 2026-10-07 이전 조사 구간 | CTA Gallery Ente/Webflow, Refero Wise | 갤러리 캡처와 추출 설명 대조 | 아래 출처·판단 보존 |
| 03:11 | 최종 Native host 변경 | 스크롤 없는 Canvas → KeyboardAvoiding + ScreenLayout | typecheck·18 tests 통과 |
| 03:14–03:20 | 최종 개발 화면 | 입력·실패·복귀·재시도 | 양 플랫폼 제목 유지 및 저장 성공 확인 |

## 3. 환경과 검증 범위

- Web: Codex IAB, 기본 1280×720 및 390×844, Storybook localhost:6006. 브라우저 세부 버전 미확인.
- Native: 기존 iPhone 17 Pro / iOS 26.5 시뮬레이터, Expo Go 57.0.9 / localhost:8084.
  사용자 지침에 따라 idb·simctl로 조작/캡처했다. 직접 Device Hub 창 검증이나 실물 Release 성능 증거가 아니다.
- 한국어, Web light 및 dark + textScale=2. Native 기본 light.
- 실제 API·계정·결제 없음. 기존 useDemoAction/ActionSession의 350ms 합성 저장 fixture.

## 4. 확인 결과와 수정

| 시나리오 | 기대 | 실제 | 판정 |
| --- | --- | --- | --- |
| Web 빈 제목 | 저장 비활성 | 시작 시 autofocus, 저장 disabled | 통과 |
| Web 실패 | 제목 유지·재시도 가능 | '비 오는 날의 산책' 유지, 오류 안내 | 통과 |
| Web 소개 복귀·재진입 | 동일 초안 복구 | 입력 remount 후 동일 값·초점 확인 | 통과 |
| Web 재시도 | 성공 값 표시 | 저장된 제목과 성공 안내 확인 | 통과 |
| Web pending | 중복·복귀 억제 | 주/보조 행동 및 실패 토글 disabled | 관찰 통과 |
| Web 390px/dark/큰 글자 | CTA·조건·오류 읽기 가능 | 주 행동 위/보조 아래, 줄바꿈, document 가로 overflow 없음 | 통과 |
| Native 긴 소개 | 아래 CTA 도달 가능 | 수정 전 스와이프해도 도달 불가, ScreenLayout 도입 후 도달 | 수정 후 통과 |
| Native 키보드 입력 | 입력·행동 접근 가능 | 키보드 전환 안정화 후 필드 y392, CTA y498, 숫자 1 입력 | 부분 확인 |
| Native 실패·재시도 | 초안 유지·저장 성공 | 제목 1 유지, 오류 후 재시도 성공·저장된 제목 1 | 통과 |
| Native 소개 복귀·재진입 | 초안 유지 | 다시 연 필드 값 1 | 통과 |

Native 문제 재현: 기본 소개의 이미지/기능 카드 아래까지 스와이프한다. 기존 Stack만으로는
Storybook Canvas가 스크롤하지 않아 주 행동이 viewport 아래에 남았다. 기존 ScreenLayout의
본문 ScrollView와 KeyboardAvoiding을 연결했다. 별도 스크롤 엔진이나 공개 컴포넌트는 추가하지 않았다.
개발 도구 버튼이 Native 조건/결과 근처에 겹치는 부분은 제품 UI 합격으로 세지 않는다.

출처 대조:
- [Ente 캡처](https://www.cta.gallery/cta/ente): desktop의 플랫폼 선택 묶음과 mobile의 우선 선택 차이.
  스토어 배지·목적지는 제품 소유로 유지한다. 실제 다운로드/가입은 수행하지 않았다.
- [Webflow 캡처](https://www.cta.gallery/cta/webflow): 주 행동 Get started와 보조 Talk to sales 위계.
  기존 BottomCTA/BottomInfo로 흡수하고 외부 브랜드·가격은 복제하지 않았다.
- [Wise 스타일](https://styles.refero.design/style/367c0c6e-73a7-441c-a8ff-91d139ac60dc): 캡처의 녹색 CTA,
  서술의 accent 역할과 추출 표의 CTA 금지 설명이 달랐다. REFERENCE_BRIEF에 관찰/추론/정규화/재구성
  구분을 추가했다. 원제품 금융 서비스 행동이나 전체 Refero 스타일 검증은 수행하지 않았다.

## 5. 자동 검사

Node 24.20.0 / pnpm 11.18.0. 기존 완료 로그 및 최종 실행 결과를 대조했다.

| 명령 | 결과 | 범위 |
| --- | --- | --- |
| pnpm --filter @hjm/showcase-native check | typecheck·18 tests 통과 | 최종 Native host 포함 |
| pnpm --filter @hjm/showcase-web check | typecheck·43 tests·token 검사 통과 | Web 변경 |
| Web Storybook build + verify:static | 성공, 103 canonical / 13 navigation | 정적 산출물, 실제 흐름 증거와 별개 |
| pnpm usage:check | 통과: tokens 12/components 138/compositions 49/screens 22 | 지침 구조 |
| pnpm docs:check, git diff --check | 통과 | 링크/공백 |

이 변경에서 package runtime은 바꾸지 않았고 전체 package CI는 재실행하지 않았다.
빌드 중 HMR로 초기화된 앞선 Web 흐름은 통과 증거에서 제외하고 새 탭에서 끝까지 다시 검증했다.

## 6. 미확인 범위

전체 CTA 551개·Refero 1,394개 시각 검토, 원제품 동작, 두 제품 팔레트, Native 다크/큰 글자/RTL,
스크린리더 발화·키보드 다양한 높이·Android, 실물 성능은 남았다. 전체 실험 승격 조건의 일부이며
후속 Codex 검증에서 다룬다. 3개 출처 관찰을 전체 사이트 완료로 확대하지 않는다.

## 7. 보관 처리

확인 결과와 실패 재현을 이 문서에 보존했다. 완료된 CTA 검사 로그와 Native 오류 캡처 및 임시
지침 병합 파일은 삭제한다. 실제 제품 소스·fixture·URL별 ledger·사용 지침은 유지하고 실행 중인
Metro·Storybook의 로그와 다른 세션 산출물은 보존한다. 계획 표에서 이 리포트를 참조한다.
