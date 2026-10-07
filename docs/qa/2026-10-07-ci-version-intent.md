# QA 리포트 — HJM 원격 품질 검사의 버전 의도

## 1. 최종 판정

**로컬 검증 통과.** 일반 코드·문서 push/PR에서 Showcase·시각 검사를 실행하던
트리거를 제거했다. main의 public package manifest 변경은 가벼운 버전 판정만 시작하며,
세 패키지의 같은 안정 버전이 실제 상승한 경우에 전체 검사를 실행한다. 명시적 수동 진단은 유지한다.
원격 버전 상승 실행·npm 게시·소비 앱 반영을 검증한 결과는 아니다.

## 2. 대상과 이력

- 대상: HJM `showcase.yml`, `visual.yml`, 새 버전 판정 도구와 governance 회귀 검사.
- 검사 기준: main `ca12e8a244860bf55d64b85873a52baa843d40b6` 위의 이 작업 미커밋 변경.
- 실행: 2026-10-07 KST, Codex. Node 24.20.0 / pnpm 11.18.0.
- 계기: 사용자가 버전 상승 때 검사하는 기존 결정을 재확인했다. HJM에는 일반 push/PR 트리거가 남아 있었다.
- 수정 전 자동 Showcase run `37564881078`은 해당 기준 SHA에서 이미 completed/success였다.
  실행 중인 작업을 취소했다고 보고하지 않으며, 수정 후 원격 전량 검사를 따로 요청하지 않았다.

## 3. 환경과 검증 범위

- 실제 현재 Git commit의 manifest 비교와 별도 임시 Git fixture를 사용했다. fixture는 여러 commit의 push를 모사한다.
- Ruby YAML 파서로 두 workflow의 문법과 job 구조를 읽었다. GitHub runner 실행 증거와 구분한다.
- UI·브라우저·Native 기기 검사 대상이 아니다. package source, 버전, 소비 dependency는 변경하지 않았다.
- GitHub 자체 CodeQL 보안 분석과 Dependabot은 이 두 품질 workflow의 제어 범위 밖이다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 조건 | 수정 전 | 수정 후 실제 확인 | 판정 |
| --- | --- | --- | --- |
| 일반 main push/PR | 버전 변경 없이 두 원격 품질 검사 실행 | PR 이벤트 제거, main push는 세 public manifest 경로로 필터링 | source 검사 통과 |
| manifest 의존성만 변경 | 전체 검사 실행 | 같은 버전이면 `run=false`; 검사 job은 intent 결과를 요구 | fixture 통과 |
| patch/minor/major 상승 | 일반 push와 구분하지 않음 | 모두 같은 새 안정 버전일 때 `run=true` | fixture 통과 |
| 여러 commit을 한 번에 push | 별도 의도 판정 없음 | 현재 commit의 부모 대신 event.before와 비교 | 임시 Git fixture 통과 |
| 버전 하락·혼합 train·유효하지 않은 값·이전 SHA 누락 | 전용 판정 없음 | 실패하며 검사 실행 결과를 발행하지 않음 | 음성 검사 통과 |
| 명시적 수동 진단 | 지원 | 이전 SHA 없이 현재 train 검사 후 `run=true` | CLI 통과 |
| npm 게시와 tag | 수동 release gate 이후 게시 | 기존 수동 workflow와 검사 순서 유지 | governance source 검사 통과 |

Showcase의 실행 job이 선택되지 않으면 그 job에 의존하는 Pages 배포도 수행되지 않는다.
main에서 버전 상승 또는 명시적 수동 검사에 성공한 경우에만 Pages를 갱신한다.
일반 테마 개발의 시연은 로컬 Storybook으로 확인한다.

## 5. 검사·관찰 결과

| 명령·조건 | 결과 | 범위 |
| --- | --- | --- |
| `pnpm governance:check` | 45 tests 통과 + 현재 governance 검사 통과 | 버전 판정, Git fixture, workflow 연결 및 우회 음성 사례 |
| 실제 `1482bea` → `ca12e8a`의 전체 SHA로 push CLI 실행 | before/after `1.14.0`, `run=false`; `GITHUB_OUTPUT`도 같은 결과 | 현재 Git 데이터에서 불변 버전 건너뛰기 |
| 실제 현재 SHA로 workflow_dispatch CLI 실행 | `run=true`, reason=manual | 명시적 수동 검사 경로 |
| 두 workflow Ruby YAML parsing | Showcase: intent/verify/deploy; visual: intent/visual | YAML 문법·job 구조 |
| `git diff --check` | 통과 | 공백 오류 없음 |

CLI는 축약 SHA를 받아들이지 않으며 실제 전체 commit SHA를 요구한다. 첫 로컬 축약 SHA 호출의
거부를 확인한 뒤 Git에서 해석한 전체 SHA로 위 시나리오를 실행했다.

## 6. 미확인 범위와 후속 조건

| 미확인 항목 | 후속 조건 |
| --- | --- |
| GitHub에서 실제 버전 상승 push의 job 실행 | 다음 승인된 버전 갱신 시 intent/검사/Pages 결과 확인 |
| 수동 원격 baseline 재생성 | 실제 필요할 때 명시적 수동 요청으로 확인 |
| 공개 package·소비 앱 | 이번 CI 변경과 별도 릴리스·채택 작업으로 검증 |

## 7. 보관 처리

임시 Git fixture와 `GITHUB_OUTPUT` 파일은 검사 종료 후 제거했다. 별도 원시 로그·캡처를
저장하지 않았다. 판정 도구·회귀 검사 소스는 재사용 가능한 CI 도구이므로 보존한다.
기존 사이트 조사 자료와 공유 개발 서버는 보존했다.
