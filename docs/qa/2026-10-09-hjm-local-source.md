# QA — HJM 로컬 소스 개발 연결

## 1. 최종 판정

개발 연결 검증 통과. 시작 2026-10-09, 마지막 확인 2026-10-10 KST. 게시·배포·제품 화면 QA 완료를 의미하지 않는다.

## 2. 대상과 이력

대상: packages/hjm-design-system. main, 기준 HEAD `04d0fedf258878e8a3458a2688f5fab50d67dccb` + 이 작업의 미커밋 변경. 수행자: Codex.
HJM을 수정할 때 dist 재생성이 필요했던 경로에 명시적 로컬 소스 모드를 추가했다. 앱은 HJM_LOCAL_SOURCE=1로 선택하며 기본 게시 패키지 선택과 lockfile은 유지한다. HJM Showcase 개발 명령에는 기본 적용했다.

## 3. 환경과 검증 범위

개발 Mac, Node 24.20.0(중앙 검증), portfolio-site 개별 검사 Node 26.11.0. 설치된 Next/Vite/Expo와 실제 HJM 소스를 사용했다. 시뮬레이터·실물 기기·로그인·API·다중 사용자 흐름은 개발 resolver 변경 범위 밖이며 실행하지 않았다. 최대 글자 조건 제외.

## 4. 확인 결과·재현과 수정

- 플래그가 없으면 기존 게시 패키지 경로, 켜면 중앙 HJM src를 읽는다. 공개 export 303개 소스 매핑 확인.
- Vite의 로컬 CJS 인라인 처리에서 Node require 오류가 발생하여 같은 원문에서 ESM helper를 생성하도록 수정, 실제 앱 config 재검증 통과.
- Metro 시작 탐색과 실제 HJM 소비를 구분하고 실제 context.dev를 검사하도록 수정. dev bundle 성공, dev=false bundle은 명시적인 로컬 소스 금지 오류로 차단.
- React 등 peer는 앱이 설치한 버전으로 해석한다. Next 외부 소스는 공통 상위 root와 공개 엔트리 alias로 연결한다.
- 기존 개발 서버는 재시작하지 않았다. 최초 opt-in 적용에는 사용자가 해당 서버를 한 번 재시작해야 한다.

## 5. 검사·관찰 결과

아래 통합 검증은 중앙 작업에서 수행했다. 모든 제품의 전체 QA로 확대 해석하지 않는다.

| 검사 | 결과 |
| --- | --- |
| node --test tests/hjm-local-source.test.mjs | 4 통과, 0 skip. 플래그·production/CI·resolver·실제 Vite 저장 후 재변환 |
| node tests/hjm-local-next-smoke.mjs | 실제 Next dev, HJM provider를 소스에서 렌더하여 HTTP 200 |
| node tests/hjm-local-metro-smoke.mjs | 실제 Expo dev iOS bundle에서 HJM native src 확인, production bundle 거부 확인 |
| 앱 설정 로딩 | Burntok/Diairy Next 및 Expo 앱 5개 설정 확인 |
| portfolio-site | 실제 Vite App.tsx 소스 변환 및 config TypeScript 검사 통과 |
| HJM Showcase | 웹 typecheck 및 Storybook plugin 연결 확인 |
| 스타일 | source styles.layered.css 변환과 hjm layer 확인 |
| 문서 | 중앙 doc-links, policy-consistency 통과 |

## 6. 미확인 범위와 후속 조건

앱의 일반 typecheck는 설치된 게시 타입을 사용한다. 새로운 공개 API는 HJM 타입 검사와 기존 후보 검증 뒤 앱별로 정식 채택한다. 모든 제품의 브라우저 상호작용·HMR·native 화면은 확인하지 않았다. Next/Metro 검사는 합성 소비 entry로 실제 소스 연결을 확인했다. 게시 exports, 버전, CI workflow, 배포 설정은 이 작업에서 변경하지 않았다. 릴리스는 기존 mac-ci 경로를 따른다. 최초 개발 QA 시점에는 커밋·push·배포를 수행하지 않았다. 2026-10-10 사용자 배포 요청에 따라 이 변경만 main에 커밋하여 원격 저장소로 전달한다. 개발 도구 배포이며 npm 게시·앱 버전 상승·운영 바이너리 배포는 포함하지 않는다. 최종 원격 SHA 확인은 중앙 배포 기록에 남긴다.

## 7. 보관 처리

테스트 fixture와 전용 서버는 종료·제거했다. 재사용 검증 스크립트만 보존한다. 루트/HJM/6개 앱은 기존 main checkout 하나씩이며 새 branch·worktree·clone을 만들지 않았다. 다른 세션의 source·dist·문서 변경과 기존 개발 서버는 보존한다. 삭제할 이 작업의 임시 branch/worktree는 없다. 사용법 정본: app-portfolio/docs/STANDARD_OPERATIONS.md의 로컬 소스 개발 절.
