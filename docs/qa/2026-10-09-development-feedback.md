# QA — HJM 개발 검사와 CI 비용 개선

검토일: 2026-10-09 · 판정: 로컬 검사 통과

## 대상과 환경

main checkout의 이번 미커밋 변경. macOS, Node 24.20.0, pnpm 11.24.0. 실제 HJM 소스를 사용했다.
개발 검증과 게시·소비 앱 채택을 분리하고, 반복 build와 불필요한 문서 변경을 줄이는 작업이다.

## 수정 전후

기존 ci:check는 package와 Showcase가 같은 패키지를 반복 build했다.
이제 build 1회 뒤 :built 검사가 같은 산출물을 재사용한다. 독립 Showcase 명령은 자체 선행 build를 유지한다.
dev:check는 변경 renderer와 contracts·Showcase만 선택하며 공용 설정 변경은 양쪽으로 확장한다.
문서만 수정하면 runtime 실행은 없다. pnpm sync는 생성물 갱신을 한 명령으로 묶는다.
공개 API·지원 행동이 바뀐 문서만 갱신하고 Changeset은 게시 소스 변경 PR 단위로 정리한다.

## 실행 결과와 재현

- pnpm ci:check: exit 0. contracts 1030, React SSR 278, browser 1161, Native 1265 통과/12 기존 skip.
- Native Showcase 21, Web Showcase 48 통과. Storybook build와 static verify 성공.
- 초기 실패: workflows.test.ts가 이전 중복 build 명령 문자열을 기대했다. 새 :built 경로로 갱신 후 전체 ci:check 통과.
- pnpm governance:check: 최종 46개 회귀 통과, internal-package-and-showcase pass=true.
- node scripts/dev-check.mjs --base HEAD --plan: 실제 변경이 공통 도구/manifest를 포함해 양쪽 선택.
  단일 renderer·공용·문서 영향 분기와 build 횟수는 dev-check.test.mjs에서 검증했다.
- pnpm sync: exit 0. 생성물 Git diff 없음.
- git diff --check: 통과. 의존성 버전과 lockfile 변경 없음.

## 리뷰 후속 수정 (2026-10-09 Claude)

- 문서 전용 변경이 실행 0개로 통과하던 문제: contracts 테스트가 루트·패키지 README와 패키지 문서를 읽으므로
  `.md`·`docs/` 변경은 contracts build·typecheck·test를 실행한다.
- Native 범위에 `bundle:check:built`(Metro), Web 범위에 renderer budget, 양쪽 모두에 `evidence:check`,
  모든 범위에 `contracts:check`·`docs:check`·`usage:check`·`api-map:check`·`workspace:check`를 추가했다.
- `git diff --no-renames`로 이름 변경의 이전 경로도 범위 판정에 넣는다(공용 → renderer 이동이 양쪽을 선택).
- Changeset 규칙: PR 없이 main에 push하는 묶음도 작업 단위로 보고, `release:version` 전에 마지막 tag 이후 변경을 확인한다.
- 검증: dev-check 회귀 2개, governance:check, `dev:check --plan`.

## 한계와 보관

원격 Actions, npm 게시, 소비 앱의 실제 후보 설치·기기 QA는 미실행이다. 속도 절감 초 수는 측정하지 않았다.
로컬 성공을 공개 배포로 표현하지 않는다. 원시 로그는 결과를 이 문서에 정리한 뒤 제거한다.
재사용 테스트 fixture와 소스는 보존한다. 최대 글자 전용 검증은 추가하지 않았다.
