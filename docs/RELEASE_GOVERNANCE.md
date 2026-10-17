# 디자인 시스템 검증과 릴리스 계약

상태: 현재 내부 릴리스 계약 · 검토일: 2026-10-17
적용: 이 저장소의 contracts, React, React Native, 두 Showcase.
Web Storybook 공개 실행 정본: [자체 도메인 게시](../deploy/storybook/README.md).
실행 원본: [npm 게시](../.github/workflows/version-packages.yml), [Storybook artifact](../.github/workflows/showcase.yml).

공통 기준은 [배포 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/DEPLOYMENT_POLICY.md)과
[모듈 개발 표준](https://github.com/jim1286/app-portfolio/blob/main/docs/MODULE_DEVELOPMENT_STANDARD.md)이다.
이 저장소의 [module.contract.json](../module.contract.json)은 `pnpm run ci:check`를 선언한다.
중앙 `contract-valid`는 해당 명령 실행, npm publish 또는 소비 제품 검증 통과가 아니다.

## 설계와 권한

세 public package는 같은 exact fixed train으로 관리한다. 제품은 필요한 renderer와
contracts를 같은 npm 버전으로 설치하고, 제품의 실제 화면·환경·업데이트 호환성을 검증한다.
이 저장소의 CI 성공은 아래 내부 범위를 증명한다. 소비 제품의 CI 또는 실기기 QA 성공은
별도 증거이며 내부 결과에서 파생하지 않는다.

| 단계 | 실행 원본 | 확인 범위 |
| --- | --- | --- |
| Storybook artifact | `showcase.yml` → `pnpm showcase:web:build` | contracts/Web build, Web Storybook build·정적 artifact 확인 |
| Pages 이동 안내 | 같은 workflow의 build 이후 deploy | 자체 도메인으로 안내하는 정적 페이지 게시 |
| 선택적 전수 진단 | 로컬 `pnpm ci:check` | package 계약·테스트·생성 drift·bundle·두 Showcase |
| 게시 전 로컬 확인 | 변경 관련 검사와 실제 게시물 확인(아래 최소화 기준) | 영향 package 타입·행동·의존 경계 및 게시 artifact. 같은 소스의 성공 결과 재사용 |
| npm publish/tag | 수동 `version-packages.yml` → 세 package build → publish → tag | npm 게시와 같은 commit의 canonical tag. 전체 검사 성공을 의미하지 않음 |
| 제품 검증 | 각 제품의 영향 표면 검사·필요한 기기 QA | 설치한 train의 실제 제품 흐름·환경·migration |

2026-10-17 감사에서 최소 배포 workflow와 과거 품질 workflow 설명이 어긋난 것을 확인했다.
폐기된 `visual.yml`, `full_regression`/`verify_only` 입력과 version-intent job은 현재 존재하지 않는다.
삭제된 workflow와 테스트 파일을 요구하던 `governance:check` 및 미사용 version-intent 도구를
제거했다. 명령 문자열·workflow step 이름을 복제하는 검사를 대체 게이트로 만들지 않는다.
실제 renderer 행동·peer 호환성·금지 의존성·게시 실패는 그대로 확인한다.

### 배포 실행 시점

현재 `showcase.yml`은 main push의 세 public package `package.json` 경로 변경 또는 수동
실행으로 시작한다. manifest의 실제 버전 증가를 비교하지 않으므로 의존성 수정도 실행할 수 있다.
일반 코드·문서만 바꾼 push와 PR 트리거는 없다. 수동 실행 역시 artifact 생성과 main의 Pages
게시 경로이며 검사 전용 모드가 아니다. 전체 회귀가 필요하면 로컬 `ci:check`를 명시적으로 선택한다.

빌드한 Storybook과 source SHA·run ID·hash를 delivery artifact에 담고, GitHub Pages에는
자체 도메인 이동 안내만 게시한다. 실제 `storybook.jmstudioapps.com` 공개는
[게시 실행서](../deploy/storybook/README.md)의 artifact 전달·공개 확인으로 구분한다.
artifact 업로드·Pages 게시를 VPS 전달 완료로 보고하지 않는다.

npm 게시는 main의 수동 `version-packages.yml`에서 frozen 설치·세 npm package build·publish·tag
순서로 실행한다. 별도의 타입·테스트·문서 게이트는 자동 실행하지 않는다. 로컬 검사 결과,
npm에 존재하는 버전, tag, 소비 앱 채택은 각각 확인한 범위로 보고한다. 두 배포 workflow는
같은 concurrency group에서 진행 중 작업을 취소하지 않고 대기한다.

## 시나리오 증거의 의미

각 renderer의 `test/executed-scenarios.json`은 실행할 환경 목록과 `all-cases` 범위를 선언한다.
실제 proof test가 이 목록을 import해 case/environment를 실행한다. package 행동 테스트 실패는 `release:check`에 전파하며, 문서/규약 감사는 명시적 `ci:check`에서 실행한다. `workspace:check`는 claim의 component/case/proof와
registry의 scenario를 결합하고, `evidence:check`는 생성 projection의 drift를 차단한다.

registry는 독립적인 테스트 성공 영수증이 아니다. 해당 source commit의 테스트 실행 결과와
함께 읽는다. Node renderer/브라우저 proof는 실제 iOS·Android 기기 검증과 범위가 다르다.
지원하지 않는 scenario는 beta debt로 남기며 실행하지 않은 device/parity 증거를 만들지 않는다.

## 제품 검증의 경계

소비 제품의 `repository_dispatch`나 제품 결과를 기다리는 게시 게이트는 두지 않는다.
공통 계약 변경은 실제 소비 제품의 영향 표면에서 확인하고, 설치 train·source와 실행 결과를
구분해 기록한다. 내부 package 검사·npm 게시·tag만으로 제품 구현 적합성을 주장하지 않는다.
2026-10-14 CI 최소화 지시를 따르며 과거의 외부 release-blocking gate 계획을 기본 후속 작업으로
유지하지 않는다. 제품 검증을 생략하거나 실패를 무시한다는 뜻은 아니다.

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

2026-10-13 잔여 시각 style 삭제는 breaking 변경이다. 최초 major 후보를 준비했으나,
사용자가 이번 릴리스도 minor로 올리도록 명시하여 fixed train을 **1.19.0**으로 결정했다.
일반적인 minor 호환성 보장을 뜻하지 않으며 제거 목록의 소비 코드는 같은 변경에서 이관한다.
버전 준비·npm 게시·소비 앱 설치 결과는 각각 확인한다.

## 번들 크기 상한

2026-10-06 사용자 결정("상한 없애"): **바이트 상한을 없앤다.** 2026-10-02에 상한을 110% 경보로 바꾼 뒤에도
기능 추가·근거 주석만으로 경보 한계를 넘어 CI가 실패했고(같은 날 Native `./overlays` 등), 상한을 올릴지
말지가 변경마다 다시 결정 사항이 됐다.

- **차단 유지**: 금지 모듈(catalog 등 metadata) 유입, 기본 진입점의 선택 peer import,
  세부 진입점의 루트 barrel 경유. 앱에 없는 native peer가 딸려 오면 타입 검사·테스트는 통과하고 기기
  Metro에서만 죽는 사고가 있었다. 바이트와 달리 이 사고를 막으므로 즉시 실패한다.
- **바이트는 측정·보고만**: `check-bundle-budget.mjs`(contracts)와 `check-renderer-budgets.mjs`(루트)는
  raw·gzip을 계속 재고, 기록된 숫자는 상한이 아니라 **기준값**으로 남아 출력에 기준 대비 증감을 보인다.
  실패·경보를 내지 않는다. 큰 증가는 PR에서 그 증감을 보고 판단한다.
- 기준값을 고치는 것은 선택이며, 큰 구조 변화(새 모듈 경로, 의존성)를 반영할 때 측정값으로 맞춘다.

2026-10-02의 "110% 경보, 상한 올리지 않음" 정책은 이 결정으로 대체됐다.

## 작업 순서

1. 계약·renderer·환경 증거를 같은 변경에서 설계한다.
2. 게시 소스 변경은 작업 단위(PR 또는 PR 없는 `main` push 묶음)를 마칠 때 Changeset으로 정리하고, `release:version` 전에 마지막 tag 이후 변경이 모두 담겼는지 확인한다. 소비 API·동작이 바뀌면 migration을 작성하며 내부 리팩터링에 형식적인 migration 문서를 요구하지 않는다.
3. 공개 계약이 바뀌면 해당 생성 명령으로 projection을 갱신한다. 개발·게시 준비 모두 변경 관련 검사를 선택하고, 같은 소스의 성공 결과를 재사용한다. 넓은 `dev:check`·`release:check`는 명시적으로 선택하는 진단이다. 게시물 확인 범위는 아래 최소화 기준을 따른다.
4. 실제 소비 제품은 설치 train과 지원 범위를 기록하고 제품의 영향 표면 검사와 필요한 기기 QA를 수행한다.
5. package release가 승인된 작업일 때 release version/commit을 만들고 수동 workflow를 실행한다.

로컬 검사, package publish, 소비 제품 구현 적합성, 원격 merge 권한을 별개 상태로 기록한다.

## 공개 API 범위와 중복 검토

2026-10-01 중복 조사에서 canonical catalog 밖의 공개 컴포넌트 이름을 확인했다.
root check의 `api-map:check`는 모든 공개 컴포넌트 export를 분류하고 정의 충돌과
생성 projection drift를 쓰기 없이 검사한다. 이 선택적 감사와 npm 배포 workflow는 별개이며
검사 시 생성물을 자동 수정해 차이를 숨기지 않는다.

기능·행동 중복은 이 검사로 판정하지 않는다. API 추가와 공통 구현 변경은
[기여 지침](../CONTRIBUTING.md)의 기존 API 비교·공통 계약 재사용·선택 기준 문서화를 따른다.
공개 범위 drift 검사 통과는 외부 소비 제품 검증이나 release gate 완료가 아니다.

### 2026-10-08 1.16.0 peer train 준비

CollectionRail과 글자 역할 등 additive API를 1.16.0으로 게시하기 위해 renderer peer를 버전 생성 전에 `>=1.16.0 <1.17.0`으로 옮긴다. 이전 범위를 유지하면 Changesets가 peer 범위 이탈을 major로 올리므로 위의 authored-next-train 순서를 따른다. 승격 승인 범위는 Storybook 탐색 규격 §2에 기록했다.

## 1.17 댓글 소개 슬롯 호환 범위

2026-10-08 optional threadHeader 릴리스에서 두 renderer의 contracts peer를 생성 전에
>=1.17.0 <1.18.0으로 선언한다. 기존 <1.17.0을 두면 Changesets가 peer 갱신을 major로
해석하고, >=1.16.0 <1.18.0으로 넓히면 workspace의 단일 minor train 검사가 실패했다.
생성 결과를 수동으로 낮추거나 검사를 완화하지 않고, 다음 train을 미리 명시하는
contracts-peer-train.mjs의 기존 계약을 따른다. 소비 제품은 같은 exact train을 사용한다.

## 릴리스 차단 조건 최소화

2026-10-17 감사에서 10/12의 `release:check` 의무가 10/14 변경 범위 검사 지시와 어긋난 것을 확인했다.
이 명령의 `test:release`는 세 패키지의 행동 테스트 전체를 실행하므로 게시 준비의 자동 선행 조건으로 두지 않는다.

- 마지막 게시 이후 바뀐 계약·renderer와 직접 소비하는 표면의 타입·핵심 동작 검사를 선택한다. 동일 소스·범위에서 통과한 결과를 재사용한다.
- 게시할 패키지는 현재 source로 build하고 버전 일치·공개 entry·타입/CSS 등 실제 artifact를 확인한다. 기존 `check-release-artifacts.mjs`는 버전과 필수 파일 존재를 확인하며 동작이나 소비 호환성을 대신하지 않는다.
- export·peer·의존 경계를 바꾸면 해당 renderer의 기존 bundle 검사를 선택한다. 금지 모듈·선택 peer 유입이나 실제 bundling 실패를 무시하지 않는다.
- 전체 패키지 진단은 `release:check`, 문서·Showcase까지 포함한 전수 감사는 `ci:check`를 명시적으로 선택할 때 실행한다. 새 CI 게이트를 추가하지 않는다.

10/12에 제거한 문서 형식·Storybook 분류·생성 증거 감사·Showcase 전수 검사, 릴리스 커밋 파일 whitelist와 Changeset 소비 형태 제한은 되살리지 않는다. 버전 일치와 artifact 존재 확인은 유지한다.

2026-10-12 규약 축소: 모듈 수 상한도 바이트와 같이 관측값으로 전환한다. 실제 HJM 게시에서 gzip이 감소했는데 helper 파일 한 개 증가로 8개 진입점이 실패했다. 파일 수는 실행 오류 증거가 아니므로 차단하지 않으며 금지 import·선택 peer 유입·실제 bundling 실패는 계속 차단한다.

Native 실제 Metro fixture의 남은 1,660,000/410,000 byte 상한도 제거했다. 모든 공개 경로에 수동 budget/면제 사유를 등록하던 의무도 폐지하고 manifest의 실제 export를 자동으로 순회한다. 새 경로도 파일 존재·금지 의존성 검사를 받는다.

`test:release`는 package 동작 검사를 실행하되 `workflows.test.ts`(Actions pin·peer train의 선택적 진단), `consumer-policy.test.ts`(규약 문구), `doc-links.test.ts`(문서 검사기)는 제외한다. 이 세 검사는 명시적인 `test`/`ci:check` 감사에 남긴다. 문서·workflow 형식 검사가 package 테스트 안에서 다시 릴리스를 막는 중복 경로를 없애기 위함이다.
