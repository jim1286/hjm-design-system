# Storybook 배포 CI 최소화

## 판정·대상

부분 확인. 2026-10-12 main의 workflow/governance 수정, 미커밋·미게시. 기존 제품 변경 보존.

## 변경·근거

사용자의 앱웹 배포 전수 최소화 요청으로 Storybook 웹 게시에 Native/browser 전체 회귀를
반복하던 경로를 분리했다. 자동은 Web dependency build/typecheck·static artifact 검증,
full_regression 수동은 기존 ci:check, visual baseline은 수동이다. npm 게시 release:check는 유지.
규범과 검사기도 함께 갱신했다.

## 검증·미확인

governance 지정 test 파일 30건 통과, YAML/의존 job 검증 통과. 웹 build·전체 package 테스트·
Native·visual·원격 CI·npm 게시·VPS 배포·새 소요 시간은 미실행. 이전 성공은 이번 변경 증거가 아니다.

## 정리

main worktree 1개, 새 branch/worktree/프로세스 없음. raw QA 출력 없음.
[공통 조사](../../../../docs/qa/2026-10-12-deployment-flow-redesign.md)에 343개 run 조사와 한계를 보존했다.
