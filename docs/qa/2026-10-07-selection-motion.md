# QA 리포트 — 선택 배경 이동의 크기 변경과 키보드 접근

## 1. 최종 판정

부분 확인. Web RTL pills의 배경 좌표 오류와 Native 큰 글자 예제의 키보드 가림을 수정했다.
실험은 유지하며 승격·릴리스·소비 앱 채택은 아직 하지 않았다.
2026-10-07 04:29 KST부터, Codex.

## 2. 대상과 이력

HJM main 3ee6564 위 미커밋 변경. Web SegmentedControl 크기 관찰, Native 선택 예제의
화면 host, 양쪽 RTL/동작 줄이기 스토리, 계약 지침과 회귀 검사.

## 3. 환경과 검증 범위

- Web: Codex IAB 개발 Storybook, 1280→390×844, RTL/dark/textScale=2. 브라우저 버전 미기록.
- Native: 기존 iPhone 17 Pro/iOS 26.5 시뮬레이터, Expo Go 57.0.9, Metro 8084.
  light/textScale=2 키보드 흐름과 dark/RTL/textScale=2 선택을 확인했다.
- idb·simctl 대체 도구이며 Device Hub UI/실물 Release 검증이 아니다.
- 선택과 메모는 예제 내부 상태이고 서버 저장·제품 데이터는 없다.
- 검사 Node 24.20.0/pnpm 11.18.0. Web 회귀는 headless Chromium.

## 4. 재현·수정·확인 결과

### Web RTL 선택 배경

1. RTL/dark/2x 스토리를 1280px에서 열고 390px로 줄인다.
2. 필터형의 선택된 하루 글자가 사라져 보였다. DOM 측정에서 항목은 x291.55,
   배경은 x1150에 남았다. connected는 항목 너비도 바뀌므로 정상 갱신됐다.
3. 기존 ResizeObserver는 항목만 관찰했다. 고정 폭 RTL pills는 부모 폭 변경 시 위치만
   이동하므로 통지를 받지 못했다. 선택 track도 관찰해 위치를 다시 맞춘다.
4. 회귀 검사는 초기 observer 통지가 끝난 뒤 부모 폭을 360→270px로 바꾼다.
   수정 전 좌표 오차 90.234375px로 실패했고 수정 후 1px 미만으로 통과했다.
   초기 통지를 기다리지 않은 첫 검사는 잘못 통과해 위 조건으로 보완했다.
5. 최종 빌드의 IAB에서 메모를 입력하고 일주일을 선택한 뒤 1280→390px로 줄였다.
   메모·양쪽 선택·결과가 유지됐고 배경 왼쪽 오차는 connected 0px/pills 0.109375px였다.
   화면 캡처에서도 선택 글자와 배경이 함께 보였다. 중간 빌드 HMR 중의 빈 화면 측정은 제외했다.

### Native 키보드

1. 큰 글자 스토리의 메모를 누르면 키보드가 메모 대부분을 가렸다.
2. KeyboardAvoiding(flex 1)→ScreenLayout→Stack과 끝 여백 spacing.md를 연결했다.
   flex 없는 첫 시도는 화면 host 높이가 없어 빈 화면이 됐고 즉시 수정했다.
3. 최종 상태에서 42를 입력하고 필터형 일주일을 눌렀다. 연결형·필터형 모두 checked가
   일주일로 바뀌고 이번 주 기록이 표시됐으며 입력 42가 유지됐다.
4. 키보드를 유지한 본문 스크롤 후 입력 전체 테두리와 값 42를 시각 확인했다.
   자동 포커스 직후에는 끝 테두리가 viewport 경계에 닿으므로 자동 노출 완전 통과는 아니다.
5. 별도 RTL/dark/2x 스토리에서 오른쪽 시작 배열과 일주일의 배경·글자·양쪽 checked 일치를 확인했다.

## 5. 검사 결과

- 수정 전 Web 선택 모션 회귀: 4 통과/1 실패, 좌표 오차 재현.
- 수정 후 같은 회귀: 5 통과.
- Native Showcase check: 타입·스토리 생성·18 tests 통과.
- ci:check의 Contracts 961, Web Node 278/브라우저 1,094, Native 1,190 테스트와
  bundle·workspace·evidence·docs·governance·API map·usage 검사는 통과했다.
  이후 Storybook 환경 순서 검사에서 ReducedMotion→Rtl 순서를 어겨 전체 명령은 exit 1이었다.
- 양쪽 스토리 순서를 수정한 뒤 실패한 storybook:check부터 남은 canonical 단계
  showcase:native:check→showcase:web:check→showcase:web:build를 재실행해 exit 0.
  Native 18/Web 43 tests, production build, 103 canonical/13 navigation 검증 통과.
  전체 ci:check 명령 한 번의 성공으로 보고하지 않으며 마지막 변경은 스토리 순서뿐이다.

## 6. 미확인 범위

Android·실물 기기·스크린리더·제품 팔레트·성능 비교와 실제 모션 감소 동작 관측은 남아 있다.
새 ReducedMotion 스토리 등록이나 기존 mock 테스트를 실제 기기 모션 검증으로 세지 않는다.
선택 배경의 최종 정렬 확인은 이동 전체 프레임·반응 속도 검증과 다르다.

## 7. 보관 처리

결과는 이 문서와 후보 ledger에 보존한다. 종료 시 임시 캡처·실패 테스트 스크린샷·검사 로그를
제거하고 제품 소스·재사용 회귀 검사와 실행 중 Metro/Storybook 로그는 보존한다.
