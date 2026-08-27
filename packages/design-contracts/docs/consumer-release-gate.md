# Consumer release gate

HJM의 canonical `v<version>` tag는 private consumer인 BurnTok Web, BurnTok Native,
Yajalal Native의 Storybook inventory가 같은 canonical release commit의 generated manifest와 맞는 경우에만
생성됩니다. canonical repository는 public이고 두 consumer는 private이므로, public caller가
private reusable workflow를 직접 호출할 수 없습니다. 자동 gate는 canonical에만 보관한 단일
fine-grained token으로 두 consumer에 `repository_dispatch`를 보내고 결과 evidence를 검증합니다.

릴리스 target의 식별자는 repository 하나가 아니라 **`repository + surface` tuple**입니다.
현재 matrix는 `burntok-web`, `burntok-native`, `yajalal-native` 세 개입니다. Yajalal에는 현재
적용 범위인 Web 앱/renderer evidence가 없으므로 `yajalal-web`을 만들어 성공을 가장하지 않습니다.

| target | repository / branch | surface | artifact prefix | evidence binding |
| --- | --- | --- | --- | --- |
| `burntok-web` | `jim1286/BurnTok` / `main` | `web` | `hjm-consumer-evidence-burntok-` | `hjm-evidence.json`의 `canonicalRelease` |
| `burntok-native` | `jim1286/BurnTok` / `main` | `native` | `hjm-consumer-evidence-burntok-native-` | `native-storybook.json` + `dispatch.json`의 `releaseCandidate` |
| `yajalal-native` | `jim1286/yajalal` / `develop` | `native` | `hjm-consumer-evidence-yajalal-` | `native-storybook.json` + `dispatch.json`의 `releaseCandidate` |

두 consumer workflow의 `run-name`은 기존
`HJM <version> · <correlation_id>`를 유지합니다. canonical이 correlation ID 끝에 target ID를
붙이므로 run-name/concurrency를 별도로 늘리지 않아도 surface run이 서로 구분됩니다. workflow는
`github.event.client_payload.surface`를 읽고 허용된 surface만 실행해야 합니다. Native
`dispatch.json`과 `inventory.releaseCandidate`에는 payload의 `surface`를 그대로 기록합니다.

## 실행 순서

1. authored Changeset을 포함한 source commit을 검증한 뒤 로컬에서 `pnpm release:version`을
   실행합니다. 생성된 fixed-package version, changelog, dist, generated docs를 하나의 release
   commit으로 `main`에 push합니다.
2. `main` push마다 `Release Packages` workflow가 실행되고, `release-candidate` step이 package
   version을 유일한 trigger로 씁니다. 현재 `v<version>` tag가 이미 있거나 authored Changeset이
   남아 있으면 `should-release=false`로 두어 나머지 step을 모두 건너뜁니다. tag가 없고 남은
   Changeset도 없는 push에서만 릴리스를 진행합니다. 이때 `pnpm release:commit:check HEAD^`가
   push된 commit이 `pnpm release:version` 생성물과 정확히 같은 shape인지(소비된 Changeset,
   허용된 path, 세 manifest의 lockstep bump, authored bump type과 일치하는 version, 동기화된
   source version 상수) 먼저 검증하고, 그 다음 package, renderer, Storybook, committed artifact를
   검증합니다. 실패한 release를 다시 시도할 때는 같은 gate를 그대로 통과하는 `workflow_dispatch`
   수동 실행을 씁니다.
3. `scripts/check-consumer-release.mjs`는 설정된 default branch 이름을 확인하고, 두 repository의
   현재 HEAD를 full SHA로 각각 한 번 캡처한 뒤 그 SHA의 workflow invariant를 검사합니다.
   BurnTok Web/Native tuple은 같은 캡처 SHA를 공유합니다.
4. script는 `{ repository, release_sha, version, correlation_id, consumer_ref, surface }` payload로
   세 `hjm-release-candidate` event를 보냅니다. 같은 repository의 동시 run이 섞이지 않도록
   공통 correlation ID에 target ID(`burntok-web` 등)를 붙인 고유 correlation ID를 사용합니다.
   consumer workflow는 `surface`를 검증하고 해당 surface job/evidence만 실행하며, 자체 checkout을
   `consumer_ref`에, public canonical checkout을 `release_sha`에 고정하고 실제 HEAD를 다시
   비교합니다.
5. canonical은 workflow 파일, event, evaluated run name, 생성 시각, 캡처한 consumer
   `head_sha`가 모두 일치하는 단 하나의 run만 추적합니다. 캡처 뒤 default branch가 이동해
   다른 SHA에서 실행된 run이나 과거 성공 run은 재사용하지 않고 즉시 실패합니다.
6. 세 run이 모두 `success`여야 하며, 각 run에서 다음 고유 artifact가 정확히 하나 생성되어야
   합니다.
   - `hjm-consumer-evidence-burntok-<burntok-web-correlation-id>`
   - `hjm-consumer-evidence-burntok-native-<burntok-native-correlation-id>`
   - `hjm-consumer-evidence-yajalal-<yajalal-native-correlation-id>`
7. canonical은 artifact ZIP을 다운로드해 evidence JSON, generated manifest, Native dispatch
   record 안의 repository, surface, canonical release SHA, consumer SHA, version, correlation ID를
   다시 exact-join합니다. evidence의 `source.id`도 target ID와 같아야 하고 `source.surface` 및
   inventory projection도 target surface와 같아야 합니다. artifact가 비었거나 만료됐거나 내부
   값이 다르면 실패합니다.
8. 위 검증이 모두 끝난 뒤에만 같은 job의 tag step이 실행되어 현재 HEAD에 `v<version>`을
   생성합니다. token 누락, dispatch 실패, timeout, cancelled/failure run, artifact 누락 또는
   payload 불일치는 모두 tag 생성을 막습니다.

## Secret과 최소 권한

canonical `hjm-design-system` repository에 Actions secret 하나만 둡니다.

- 이름: `HJM_CONSUMER_SYNC_TOKEN`
- 종류: fine-grained personal access token 또는 동등한 GitHub App token
- repository access: `jim1286/BurnTok`, `jim1286/yajalal`만 선택
- repository permissions:
  - `Contents: Read and write` — `repository_dispatch` 생성
  - `Actions: Read-only` — workflow run과 evidence artifact 조회·다운로드

consumer repository에는 `HJM_CANONICAL_READ_TOKEN`이 필요하지 않습니다. canonical은 public이라
consumer의 기본 `GITHUB_TOKEN`으로 full SHA를 읽을 수 있고, consumer 자체 private checkout은
각 consumer run의 기본 token으로 수행합니다. broad classic PAT를 복제하거나 소비 앱에 canonical
token을 저장하지 않습니다.

## 이 gate가 증명하는 것과 증명하지 않는 것

이 gate는 canonical release SHA의 active ID가 실제 exported CSF story에 빠짐없이 연결되고,
BurnTok Web에서는 built Storybook index에, BurnTok Native와 Yajalal Native에서는 generated
Native registration과 Storybook CSF index 해석 결과에 결합됐음을 surface별로 증명합니다.
known planned ID는 문서 registration으로만 남고 active evidence에는 포함되지 않습니다.

inventory 일치만으로 dark/RTL/large-text/accessibility scenario가 실행됐다고 주장하지 않습니다.
새 tag가 생성된 뒤 consumer dependency를 그 tag의 package path로 올리고 각 앱의 CI/device gate를
통과시키는 작업도 별도 adoption 단계입니다.
