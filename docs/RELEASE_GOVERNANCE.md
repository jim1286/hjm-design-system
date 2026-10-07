# 디자인 시스템 검증과 릴리스 계약

상태: 현재 내부 릴리스 계약 · 검토일: 2026-10-07
적용: 이 저장소의 contracts, React, React Native, 두 Showcase.
기계 검사: [`scripts/check-release-governance.mjs`](../scripts/check-release-governance.mjs).

공통 기준은 [배포 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/DEPLOYMENT_POLICY.md)과
[모듈 개발 표준](https://github.com/jim1286/app-portfolio/blob/main/docs/MODULE_DEVELOPMENT_STANDARD.md)이다.
이 저장소의 [module.contract.json](../module.contract.json)은 `pnpm run ci:check`를 선언한다.
중앙 `contract-valid`는 해당 명령 실행, npm publish 또는 소비 제품 검증 통과가 아니다.

## 설계와 권한

세 public package는 같은 exact fixed train으로 관리한다. 제품은 필요한 renderer와
contracts를 같은 npm 버전으로 설치하고, 제품의 실제 화면·환경·업데이트 호환성을 검증한다.
이 저장소의 CI 성공은 아래 내부 범위를 증명한다. 소비 제품의 CI 또는 실기기 QA 성공은
별도 증거이며 내부 결과에서 파생하지 않는다.

| 단계 | 실행 원본 | 검사 범위 |
| --- | --- | --- |
| 버전 상승/main 또는 수동 내부 검사 | `showcase.yml` → 버전 판정 → `pnpm ci:check` | package 계약·테스트·생성 drift·bundle·두 Showcase |
| 버전 상승/main 또는 수동 시각 검사 | `visual.yml` → 같은 버전 판정 → Linux baseline 비교 | Chromium/Linux의 대표 시각 회귀 |
| package 검사 | `pnpm check` | 세 package check, renderer bundle, workspace/evidence/docs/governance/public API map 검사 |
| release 후보 | `version-packages.yml` → `pnpm release:commit:check`와 `pnpm release:check` | release commit 형태, 내부 ci:check, release artifacts |
| publish/tag | 같은 workflow에서 검사 이후 실행 | 세 package publish 후 같은 commit에 canonical tag |
| 제품 검증 | 각 제품 저장소의 CI/기기 QA | 설치된 npm train을 소비한 제품 흐름·환경·migration |

2026-10-02 사용자 요청으로 `release:commit:check`는 Changeset의 major/minor 등급에서
버전 번호를 역산하는 검사를 제거했다. 버전 번호는 유지보수자가 결정한다.
고정 패키지·manifest·evidence의 버전 일치, 안정적인 버전 형식, 실제 게시 여부는
여전히 검사한다. 등급이 실제 호환성을 보증하지 않으므로 소비 앱 검증이 필요하다.

`pnpm governance:check`는 canonical 명령 연결, 필수 workflow step의 무조건 실행·실패 전파,
publish/tag 이전 순서, renderer 테스트와 scenario registry 연결을 검사한다. 의도하지 않은
검사 제거·조건부 건너뛰기·`continue-on-error`를 negative tests로 고정한다. 이 검사는
현재 저장소의 제한된 workflow 형태에 대한 source 검사이며 원격 required-check 설치 여부는
별도 운영 설정이다. workflow 형태를 바꿀 때 검사와 회귀 사례를 함께 바꾼다.

### 자동 검사의 실행 시점

2026-10-07 사용자가 버전 상승 때만 원격 검사를 실행하는 기존 결정을 재확인했다.
HJM에는 일반 main push/PR 트리거가 남아 테마 개발 commit마다 전량 검사가 실행됐으므로,
Showcase와 시각 검사도 버전 의도로 한정한다. 자동 실행 후보는 main push에서 세 public
package의 `package.json` 중 하나가 바뀔 때이며, 의존성·설정 변경만으로는 전량 검사를 실행하지 않는다.
[`ci-version-intent.mjs`](../scripts/ci-version-intent.mjs)가 `github.event.before`와 현재 SHA의
세 fixed-train 버전을 비교해 모두 같은 안정 버전으로 실제 상승한 경우에만 실행한다.
여러 commit을 함께 push할 수 있으므로 `HEAD^`로 대체하지 않는다. 이전 SHA 누락·버전 하락·
혼합 train·잘못된 버전은 판정 실패로 남기고 임의로 검사 실행을 승인하지 않는다.

일반 코드·문서 push/PR은 이 두 원격 검사 workflow를 시작하지 않는다. `workflow_dispatch`는
명시적인 진단·Linux baseline 재생성 경로로 유지한다. main에서 실행된 Showcase 검사가
통과한 뒤에만 Pages가 갱신되므로, 일반 테마 개발의 확인은 로컬 Storybook으로 수행한다.
원격 트리거 축소는 필요한 로컬 검증을 제거하는 변경이 아니다. npm 게시와 tag 생성은
기존 수동 `version-packages.yml`의 release 검사를 유지하며 자동 게시로 바꾸지 않는다.
GitHub 자체의 보안 분석·Dependabot 실행은 이 두 품질 workflow의 제어 범위와 별개다.

## 시나리오 증거의 의미

각 renderer의 `test/executed-scenarios.json`은 실행할 환경 목록과 `all-cases` 범위를 선언한다.
실제 proof test가 이 목록을 import해 case/environment를 실행하고, package test 실패는
상위 `ci:check`와 release job에 전파된다. `workspace:check`는 claim의 component/case/proof와
registry의 scenario를 결합하고, `evidence:check`는 생성 projection의 drift를 차단한다.

registry는 독립적인 테스트 성공 영수증이 아니다. 해당 source commit의 테스트 실행 결과와
함께 읽는다. Node renderer/브라우저 proof는 실제 iOS·Android 기기 검증과 범위가 다르다.
지원하지 않는 scenario는 beta debt로 남기며 실행하지 않은 device/parity 증거를 만들지 않는다.

## 제품 검증과 향후 외부 gate

현재 release workflow에는 외부 소비 제품의 `repository_dispatch`, consumer SHA 수집,
run/artifact correlation 검증 또는 두 제품 결과를 기다리는 gate가 **구현되어 있지 않다**.
package publish와 canonical tag는 내부 검사를 기준으로 한다. 기존 문서의 외부 gate 완료
표현은 이 계약으로 정정한다.

향후 release-blocking consumer gate가 필요하면 제품을 하드코딩하기 전에 다음을 별도 설계한다.

1. 소비 제품 등록부, 선택 기준·필수/선택 구분, 검증할 runtime과 source SHA.
2. 최소 권한 인증, dispatch/run/artifact의 release SHA·consumer SHA·correlation 결합.
3. timeout, 누락·실패·재실행 처리와 모든 필수 결과 확인 뒤 publish/tag하는 순서.
4. 실제 성공·실패 integration evidence와 `governance:check`의 지원 범위 갱신.

위 항목은 계획이며 token, SHA 또는 통과 evidence를 임의로 채우지 않는다.

## Contracts peer 범위

두 renderer는 `@hjmds/design-contracts`를 peer로 선언하며 범위는 **정확히 한 minor
train**이어야 한다(`>=0.9.0 <0.10.0` 형태). renderer와 contracts를 서로 다른 train으로
섞어 설치하는 것을 막는 장치이며 `check-workspace-sync.mjs`가 형태를 검사한다.

train을 올리는 release에서는 **버전 PR보다 먼저** 이 범위를 다음 train으로 옮긴다.
검사기는 이 상태(authored next train)를 허용하며, 다음 train은 같은 major의 다음 minor
(`0.10.0` → `>=0.11.0 <0.12.0`)이거나 major를 올리는 release에서는 다음 major의 `.0` train
(`0.10.0` → `>=1.0.0 <1.1.0`)이다. 후자는 1.0.0 release에서 처음 필요해졌다 —
검사기가 0.x만 표현하고 있어 규칙대로 작성한 범위가 거부됐다. 어느 자리를 올릴지는
release의 결정이고 검사기의 결정이 아니다. 규칙은 `scripts/contracts-peer-train.mjs`에 있고 회귀 사례는
`packages/design-contracts/test/workflows.test.ts`의 "contracts peer train"에 있다. 순서를 뒤집으면 안 된다:
`release:version`이 도는 시점에 범위가 아직 이전 train을 가리키고 있으면 contracts의
minor bump가 범위를 벗어나고, changesets는 범위를 벗어나는 peer 변경을 dependents의
**major**로 승격시킨다. `fixed` 그룹이 세 패키지를 같은 버전으로 맞추므로 결과는 train
전체가 major로 올라가는 것이다. 실제로 0.9.12에서 skeleton 기본값 하나를 바꾸는 minor
변경이 1.0.0을 만들어 냈다. 버전 번호는 변경의 크기를 나타내야 하고 도구의 부수효과여서는
안 된다.

## 1.11.0 호환 API 제거

2026-10-02 사용자가 관리 소비 앱을 함께 버전업하기로 결정했다. deprecated 스타일 통로와
이전 상태·목록·배치 별칭을 1.11.0 fixed minor에서 제거한다.
이는 일반적인 SemVer 해석과 다르지만 2026-10-02 사용자가 버전과 전수 이관 범위를 직접 결정했다.
기존 1.x 소비 제품은 자동으로 호환된다고 보지 않고 정확한 버전 설치와 화면·타입 검증 후 갱신한다. 제거 범위와 대체 경로는
[이관표](../packages/design-contracts/docs/migration-native-legacy-removal.md)가 정한다.
1.x 설치본의 호환 동작을 현재 소스의 보장으로 설명하지 않는다. 내부 recipe 스타일은
비공개 구현에 두고 제품 배치는 `layoutStyle`, 시각 값은 semantic API를 사용한다.

타입 검사, 소비 dependency/lock 이관, 기기 증거, npm 게시는 각각 기록한다.
후보 패키지로 검사한 결과만으로 게시·소비 설치 완료를 주장하지 않는다.

## 번들 크기 상한

2026-10-06 사용자 결정("상한 없애"): **바이트 상한을 없앤다.** 2026-10-02에 상한을 110% 경보로 바꾼 뒤에도
기능 추가·근거 주석만으로 경보 한계를 넘어 CI가 실패했고(같은 날 Native `./overlays` 등), 상한을 올릴지
말지가 변경마다 다시 결정 사항이 됐다.

- **차단 유지**: 모듈 수 초과, 금지 모듈(catalog 등 metadata) 유입, 기본 진입점의 선택 peer import,
  세부 진입점의 루트 barrel 경유. 앱에 없는 native peer가 딸려 오면 타입 검사·테스트는 통과하고 기기
  Metro에서만 죽는 사고가 있었다. 바이트와 달리 이 사고를 막으므로 즉시 실패한다.
- **바이트는 측정·보고만**: `check-bundle-budget.mjs`(contracts)와 `check-renderer-budgets.mjs`(루트)는
  raw·gzip을 계속 재고, 기록된 숫자는 상한이 아니라 **기준값**으로 남아 출력에 기준 대비 증감을 보인다.
  실패·경보를 내지 않는다. 큰 증가는 PR에서 그 증감을 보고 판단한다.
- 기준값을 고치는 것은 선택이며, 큰 구조 변화(새 모듈 경로, 의존성)를 반영할 때 측정값으로 맞춘다.

2026-10-02의 "110% 경보, 상한 올리지 않음" 정책은 이 결정으로 대체됐다.

## 작업 순서

1. 계약·renderer·환경 증거를 같은 변경에서 설계한다.
2. public source/API 변경이면 Changeset과 소비 migration을 작성한다.
3. 생성 명령으로 projection을 갱신하고 `pnpm ci:check`를 실행한다.
4. 실제 소비 제품은 설치 train과 지원 범위를 기록하고 별도 제품 CI/기기 QA를 검증한다.
5. package release가 승인된 작업일 때 release version/commit을 만들고 수동 workflow를 실행한다.

로컬 검사, package publish, 소비 제품 구현 적합성, 원격 merge 권한을 별개 상태로 기록한다.

## 공개 API 범위와 중복 검토

2026-10-01 중복 조사에서 canonical catalog 밖의 공개 컴포넌트 이름을 확인했다.
root check의 `api-map:check`는 모든 공개 컴포넌트 export를 분류하고 정의 충돌과
생성 projection drift를 쓰기 없이 검사한다. governance 음성 테스트는 이 gate를
삭제하거나 write mode로 바꾸는 것을 거부한다.

기능·행동 중복은 이 검사로 판정하지 않는다. API 추가와 공통 구현 변경은
[기여 지침](../CONTRIBUTING.md)의 기존 API 비교·공통 계약 재사용·선택 기준 문서화를 따른다.
공개 범위 drift 검사 통과는 외부 소비 제품 검증이나 release gate 완료가 아니다.

### 2026-10-08 1.16.0 peer train 준비

CollectionRail과 글자 역할 등 additive API를 1.16.0으로 게시하기 위해 renderer peer를 버전 생성 전에 `>=1.16.0 <1.17.0`으로 옮긴다. 이전 범위를 유지하면 Changesets가 peer 범위 이탈을 major로 올리므로 위의 authored-next-train 순서를 따른다. 승격 승인 범위는 Storybook 탐색 규격 §2에 기록했다.
