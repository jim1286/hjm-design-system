# 선택 버튼 테두리 제거 — 2026-10-10

사용자 요청: Spint 반응을 누르면 생기는 테두리를 디자인 시스템에서 제거.
main 65afd501 및 작업 미커밋 변경, HJM 1.17.2. 기존 카드·하단 탐색 작업은 보존했다.

Button·IconButton 선택 recipe의 border를 null로 바꾸고 Web은 선택 border-color를 transparent로,
Native Button은 null을 tone border로 되돌리지 않으며 IconButton은 선택 borderWidth 0으로 렌더한다.
contentBrand 색·bg·접근성 선택 상태와 Web 키보드 focus outline은 유지한다.
일반 secondary 경계 및 Chip·입력 선택 recipe는 이번 변경 대상이 아니다.
사용 지침 Button·IconButton 갱신 및 usage:sync, 세 package patch changeset 기록.

- contracts core-normalization.test.ts: 5개 통과.
- Native renderer-recipe-regressions.test.tsx toggle treatment / icon-button toggle 지정: 2개 통과, 33개 범위 제외.
- Web recipe-alignment.browser.test.tsx selected button 지정: Chromium light/dark 2개 통과, 10개 범위 제외. 실제 계산된 투명 경계·선택 색·aria-pressed·focus outline 확인.
- 세 package build, Web/Native typecheck: 통과.
- diff --check: 통과. 전체 테스트·최대 글자·실기기·npm 게시·공개 Storybook 배포는 미실행.
- Spint 기존 개발 Metro 8183을 같은 API와 실행 옵션으로 재시작, HJM_LOCAL_SOURCE=1로 로컬 HJM 소비.
  lockfile·게시 버전 변경 없이 개발 반영한다. Metro manifest의 /apps/mobile/index.ts.bundle 조회 200,
  로컬 selected recipe 및 serverClock 포함을 확인했다. Native 화면 확인은 아직 미실행.
  처음 /index.bundle 조회는 404여서 manifest의 실제 entry URL로 다시 확인했다.
- 이 작업의 임시 branch/worktree 없음. main checkout 하나. 기존 다른 세션 작업 및 서버·시뮬레이터 보존.
