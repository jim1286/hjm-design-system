# 디자인 시스템 검증과 릴리스 계약

상태: 현재 내부 릴리스 계약 · 2026-09-07
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
| PR/main 내부 검사 | `showcase.yml` → `pnpm ci:check` | package 계약·테스트·생성 drift·bundle·두 Showcase |
| package 검사 | `pnpm check` | 세 package check, workspace/evidence/docs/governance 검사 |
| release 후보 | `version-packages.yml` → `pnpm release:commit:check`와 `pnpm release:check` | release commit 형태, 내부 ci:check, release artifacts |
| publish/tag | 같은 workflow에서 검사 이후 실행 | 세 package publish 후 같은 commit에 canonical tag |
| 제품 검증 | 각 제품 저장소의 CI/기기 QA | 설치된 npm train을 소비한 제품 흐름·환경·migration |

`pnpm governance:check`는 canonical 명령 연결, 필수 workflow step의 무조건 실행·실패 전파,
publish/tag 이전 순서, renderer 테스트와 scenario registry 연결을 검사한다. 의도하지 않은
검사 제거·조건부 건너뛰기·`continue-on-error`를 negative tests로 고정한다. 이 검사는
현재 저장소의 제한된 workflow 형태에 대한 source 검사이며 원격 required-check 설치 여부는
별도 운영 설정이다. workflow 형태를 바꿀 때 검사와 회귀 사례를 함께 바꾼다.

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

## Native 호환 API

[소비 정책](../packages/design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary)의
raw style 이관 규칙을 적용한다. `layoutStyle`을 제공하는 설치 버전에서는 좁은 composition
API를 사용하고, 없는 버전에서는 wrapper 또는 검토한 semantic API를 사용한다.
0.9 호환 API가 타입상 호출된다는 사실은 신규 raw style 채택의 허가가 아니다.

타입에서 `layoutStyle`의 금지 key를 제외하는 검사, 기존 raw style 런타임 호환성,
제품의 신규 raw style 유입 차단은 서로 다른 검증이다. 이 변경은 기존 raw style을 런타임에서
제거하거나 필터링하지 않는다. 공지한 이관·evidence·breaking train 조건을 충족한 뒤 제거한다.

## 작업 순서

1. 계약·renderer·환경 증거를 같은 변경에서 설계한다.
2. public source/API 변경이면 Changeset과 소비 migration을 작성한다.
3. 생성 명령으로 projection을 갱신하고 `pnpm ci:check`를 실행한다.
4. 실제 소비 제품은 설치 train과 지원 범위를 기록하고 별도 제품 CI/기기 QA를 검증한다.
5. package release가 승인된 작업일 때 release version/commit을 만들고 수동 workflow를 실행한다.

로컬 검사, package publish, 소비 제품 구현 적합성, 원격 merge 권한을 별개 상태로 기록한다.
